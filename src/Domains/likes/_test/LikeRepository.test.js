const LikeRepository = require('../LikeRepository');

describe('LikeRepository interface', () => {
  it('should throw error when invoke abstract behavior', async () => {
    const likeRepository = new LikeRepository();
    const message = 'LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED';

    // Action and Assert
    await expect(likeRepository.addLike({})).rejects.toThrowError(message);
    await expect(likeRepository.deleteLike({})).rejects.toThrowError(message);
    await expect(likeRepository.verifyLikeAvailability({})).rejects.toThrowError(message);
    await expect(likeRepository.getLikesInComment({})).rejects.toThrowError(message);
  });
});
