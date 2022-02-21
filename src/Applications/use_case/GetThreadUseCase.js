const GetThread = require('../../Domains/threads/entities/GetThread');

class GetThreadUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(params) {
    const { threadId } = new GetThread(params);
    await this._threadRepository.verifyThreadById(threadId);

    const detailThread = await this._threadRepository.getThreadById(threadId);
    const commentsInThread = await this._commentRepository.getCommentsByThreadId(threadId);
    return { detailThread, commentsInThread };
  }
}

module.exports = GetThreadUseCase;
