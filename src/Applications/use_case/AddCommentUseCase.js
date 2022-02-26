const PostComment = require('../../Domains/comments/entities/PostComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(request, userId) {
    const postComment = new PostComment(request, userId);
    await this._threadRepository.verifyThreadById(postComment.threadId);

    return this._commentRepository.addComment({ ...postComment });
  }
}

module.exports = AddCommentUseCase;
