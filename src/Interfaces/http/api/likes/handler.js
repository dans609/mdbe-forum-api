const PutLikeUseCase = require('../../../../Applications/use_case/PutLikeUseCase');

class LikesHandler {
  constructor(container) {
    this._container = container;

    this.putLikeHandler = this.putLikeHandler.bind(this);
  }

  async putLikeHandler(request) {
    const { id: userId } = request.auth.credentials;
    const putLikeUseCase = this._container.getInstance(PutLikeUseCase.name);
    await putLikeUseCase.execute(request.params, userId);

    return { status: 'success' };
  }
}

module.exports = LikesHandler;
