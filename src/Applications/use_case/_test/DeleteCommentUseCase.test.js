const DeleteComment = require('../../../Domains/comments/entities/DeleteComment');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  it('should orchestrating soft delete comment action correctly', async () => {
    // Arrange
    const params = { threadId: 'thread-123', commentId: 'comment-123' };
    const userId = 'user-123';

    /* creating dependency for the use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockAuthManager = new AuthenticationTokenManager();

    /* mocking needed function of the dependency */
    mockThreadRepository.verifyThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentOwner = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentNotDeleted = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.softDeleteById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /* creating use case instance */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      authTokenManager: mockAuthManager,
    });

    // Action
    const entity = new DeleteComment(params, userId);
    await deleteCommentUseCase.execute(params, userId);

    // Assert
    expect(mockThreadRepository.verifyThreadById).toBeCalledWith(entity.threadId);
    expect(mockCommentRepository.verifyCommentByThreadId).toBeCalledWith({ ...entity });
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith({ ...entity });
    expect(mockCommentRepository.verifyCommentNotDeleted).toBeCalledWith(entity.commentId);
    expect(mockCommentRepository.softDeleteById).toBeCalledWith(entity.commentId);
  });
});
