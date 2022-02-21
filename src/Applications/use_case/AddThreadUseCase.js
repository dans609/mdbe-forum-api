const PostThread = require('../../Domains/threads/entities/PostThread');

class AddThreadUseCase {
  constructor({ threadRepository, authTokenManager }) {
    this._threadRepository = threadRepository;
    this._authTokenManager = authTokenManager;
  }

  async execute(useCasePayload, useCaseHeaders) {
    const postThread = new PostThread(useCasePayload, useCaseHeaders);
    const accessToken = await this._authTokenManager.getTokenByHeaders(postThread.authToken);
    const legitUserPayload = await this._authTokenManager.decodePayload(accessToken);

    return this._threadRepository.addThread({ ...postThread, owner: legitUserPayload.id });
  }
}

module.exports = AddThreadUseCase;
