const ThreadRepository = require('../ThreadRepository');

describe('ThreadRepository interface', () => {
  it('should throw error when invoke abstract behavior', async () => {
    // Arrange
    const threadRepository = new ThreadRepository();
    const message = 'THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED';

    // Action and Assert
    await expect(threadRepository.addThread({})).rejects.toThrowError(message);
    await expect(threadRepository.verifyThreadById({})).rejects.toThrowError(message);
    await expect(threadRepository.getThreadById({})).rejects.toThrowError(message);
  });
});
