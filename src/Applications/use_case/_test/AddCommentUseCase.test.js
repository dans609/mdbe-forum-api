const PostComment = require('../../../Domains/comments/entities/PostComment');
const PostedComment = require('../../../Domains/comments/entities/PostedComment');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  it('should orchestrating the add comment action correctly', async () => {
    // Arrange
    const payload = { content: 'Content dari komentar' };
    const headers = { authorization: 'Bearer token-123' };
    const params = { threadId: 'thread-123' };
    const expectedPostedComment = new PostedComment({
      id: 'comment-123',
      content: 'Content dari komentar',
      owner: 'user-123',
    });

    /* creating dependency for the use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockAuthManager = new AuthenticationTokenManager();

    /* mocking needed function of the dependency */
    mockThreadRepository.verifyThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.addComment = jest.fn()
      .mockImplementation(() => Promise.resolve(new PostedComment({
        id: 'comment-123',
        content: 'Content dari komentar',
        owner: 'user-123',
      })));
    mockAuthManager.getTokenByHeaders = jest.fn()
      .mockImplementation(() => Promise.resolve('token-123'));
    mockAuthManager.decodePayload = jest.fn().mockImplementation(() => Promise.resolve({
      id: expectedPostedComment.owner,
      username: 'dicoding',
    }));

    /* creating use case instance */
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      authTokenManager: mockAuthManager,
    });

    // Action
    const request = { payload, params };
    const postComment = new PostComment(request, headers.authorization);
    const postedComment = await addCommentUseCase.execute(request, headers.authorization);

    // Assert
    expect(postedComment).toStrictEqual(expectedPostedComment);
    expect(mockAuthManager.getTokenByHeaders).toBeCalledWith(headers.authorization);
    expect(mockAuthManager.decodePayload).toBeCalledWith('token-123');
    expect(mockThreadRepository.verifyThreadById).toBeCalledWith(params.threadId);
    expect(mockCommentRepository.addComment).toBeCalledWith({
      ...postComment, owner: expectedPostedComment.owner,
    });
  });
});
