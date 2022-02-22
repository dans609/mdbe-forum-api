const DeleteComment = require('../../Domains/comments/entities/DeleteComment');

class DeleteCommentUseCase {
  constructor({ commentRepository, threadRepository, authTokenManager }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
    this._authTokenManager = authTokenManager;
  }

  async execute(params, headerAuth) {
    const entity = new DeleteComment(params, headerAuth);
    const accessToken = await this._authTokenManager.getTokenByHeaders(entity.authToken);
    const userPayload = await this._authTokenManager.decodePayload(accessToken);

    await this._threadRepository.verifyThreadById(entity.threadId);
    await this._commentRepository.verifyCommentByThreadId({ ...entity });
    await this._commentRepository.verifyCommentOwner({ ...entity, owner: userPayload.id });
    await this._commentRepository.verifyCommentNotDeleted(entity.commentId);
    await this._commentRepository.softDeleteById(entity.commentId);
  }
}

module.exports = DeleteCommentUseCase;
