const CommentRepository = require('../CommentRepository');

describe('CommentRepository interface', () => {
  it('should throw error when invoke abstract behavior', async () => {
    // Arrange
    const commentRepository = new CommentRepository();
    const message = 'COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED';

    // Action and Assert
    await expect(commentRepository.addComment({})).rejects.toThrowError(message);
    await expect(commentRepository.verifyCommentByThreadId({})).rejects.toThrowError(message);
    await expect(commentRepository.verifyCommentOwner({})).rejects.toThrowError(message);
    await expect(commentRepository.verifyCommentNotDeleted({})).rejects.toThrowError(message);
    await expect(commentRepository.softDeleteById({})).rejects.toThrowError(message);
    await expect(commentRepository.getCommentsByThreadId({})).rejects.toThrowError(message);
  });
});
