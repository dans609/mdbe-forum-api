const PostThread = require('../../Domains/threads/entities/PostThread');

class AddThreadUseCase {
  constructor(threadRepository) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload, userId) {
    const postThread = new PostThread(useCasePayload, userId);

    return this._threadRepository.addThread({ ...postThread });
  }
}

module.exports = AddThreadUseCase;
