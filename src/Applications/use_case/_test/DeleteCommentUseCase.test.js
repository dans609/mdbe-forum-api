const DeleteComment = require('../../../Domains/comments/entities/DeleteComment');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  it('should orchestrating soft delete comment action correctly', async () => {
    // Arrange
    const params = { threadId: 'thread-123', commentId: 'comment-123' };
    const headers = { authorization: 'Bearer token-123' };

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
    mockAuthManager.getTokenByHeaders = jest.fn()
      .mockImplementation(() => Promise.resolve('token-123'));
    mockAuthManager.decodePayload = jest.fn()
      .mockImplementation(() => Promise.resolve({
        id: 'user-123',
        username: 'dicoding',
      }));

    /* creating use case instance */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      authTokenManager: mockAuthManager,
    });

    // Action
    const entity = new DeleteComment(params, headers.authorization);
    await deleteCommentUseCase.execute({ ...params }, headers.authorization);

    // Assert
    expect(mockThreadRepository.verifyThreadById).toBeCalledWith(entity.threadId);
    expect(mockAuthManager.getTokenByHeaders).toBeCalledWith(entity.authToken);
    expect(mockAuthManager.decodePayload).toBeCalledWith('token-123');
    expect(mockCommentRepository.verifyCommentNotDeleted).toBeCalledWith(entity.commentId);
    expect(mockCommentRepository.softDeleteById).toBeCalledWith(entity.commentId);
    expect(mockCommentRepository.verifyCommentByThreadId).toBeCalledWith({ ...entity });
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith({
      ...entity,
      owner: 'user-123',
    });
  });
});
