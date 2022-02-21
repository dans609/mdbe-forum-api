const PostComment = require('../../Domains/comments/entities/PostComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository, authTokenManager }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
    this._authTokenManager = authTokenManager;
  }

  async execute(request, headerAuth) {
    const postComment = new PostComment(request, headerAuth);
    const accessToken = await this._authTokenManager.getTokenByHeaders(postComment.authToken);
    const legitUserPayload = await this._authTokenManager.decodePayload(accessToken);
    await this._threadRepository.verifyThreadById(postComment.threadId);

    return this._commentRepository.addComment({ ...postComment, owner: legitUserPayload.id });
  }
}

module.exports = AddCommentUseCase;
