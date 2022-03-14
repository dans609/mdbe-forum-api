const GetThread = require('../../Domains/threads/entities/GetThread');

class GetThreadUseCase {
  constructor({ threadRepository, commentRepository, likeRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._likeRepository = likeRepository;
  }

  async _addLikeCountProperty(comments, len, newComments = [], i = 0) {
    const arr = newComments;
    if (!len) return arr;

    const comment = { ...comments[i] };
    const getLike = await this._likeRepository.getLikesInComment(comment.id);
    comment.likeCount = getLike.likeCount;
    arr.push(comment);
    return this._addLikeCountProperty(comments, len - 1, arr, i + 1);
  }

  async execute(params) {
    const { threadId } = new GetThread(params);
    await this._threadRepository.verifyThreadById(threadId);

    const detailThread = await this._threadRepository.getThreadById(threadId);
    const commentsInThread = await this._commentRepository.getCommentsByThreadId(threadId);
    const detailComments = await this._addLikeCountProperty(
      commentsInThread, commentsInThread.length,
    );

    return { ...detailThread, comments: [...detailComments] };
  }
}

module.exports = GetThreadUseCase;
