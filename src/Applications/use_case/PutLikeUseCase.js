const PutLike = require('../../Domains/likes/entities/PutLike');

class PutLikeUseCase {
  constructor({ threadRepository, commentRepository, likeRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._likeRepository = likeRepository;
  }

  async execute(params, userId) {
    const putLike = new PutLike(params, userId);
    await this._threadRepository.verifyThreadById(putLike.threadId);
    await this._commentRepository.verifyCommentByThreadId(putLike);

    const isAvailable = await this._likeRepository.verifyLikeAvailability(putLike);
    if (!isAvailable) await this._likeRepository.addLike(putLike);
    else await this._likeRepository.deleteLike(putLike);
  }
}

module.exports = PutLikeUseCase;
