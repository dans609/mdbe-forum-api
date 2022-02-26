const PostThread = require('../../Domains/threads/entities/PostThread');

class AddThreadUseCase {
  constructor({ threadRepository, authTokenManager }) {
    this._threadRepository = threadRepository;
    this._authTokenManager = authTokenManager;
  }

  async execute(useCasePayload, userId) {
    const postThread = new PostThread(useCasePayload, userId);

    return this._threadRepository.addThread({ ...postThread, owner: userId });
  }
}

module.exports = AddThreadUseCase;
