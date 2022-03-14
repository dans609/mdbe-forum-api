const DeleteComment = require('../../Domains/comments/entities/DeleteComment');

class DeleteCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(params, userId) {
    const entity = new DeleteComment(params, userId);

    await this._threadRepository.verifyThreadById(entity.threadId);
    await this._commentRepository.verifyCommentByThreadId(entity);
    await this._commentRepository.verifyCommentOwner(entity);
    await this._commentRepository.verifyCommentNotDeleted(entity.commentId);
    await this._commentRepository.softDeleteById(entity.commentId);
  }
}

module.exports = DeleteCommentUseCase;
