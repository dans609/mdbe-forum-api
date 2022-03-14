const PostComment = require('../../../Domains/comments/entities/PostComment');
const PostedComment = require('../../../Domains/comments/entities/PostedComment');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  it('should orchestrating the add comment action correctly', async () => {
    // Arrange
    const userId = 'user-123';
    const request = {
      payload: { content: 'Content dari komentar' },
      params: { threadId: 'thread-123' },
    };
    const expectedPostedComment = new PostedComment({
      id: 'comment-123',
      content: request.payload.content,
      owner: userId,
    });

    /* creating dependency for the use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /* mocking needed function of the dependency */
    mockThreadRepository.verifyThreadById = jest.fn(() => Promise.resolve());
    mockCommentRepository.addComment = jest.fn(() => Promise.resolve(new PostedComment({
      id: 'comment-123',
      content: 'Content dari komentar',
      owner: 'user-123',
    })));

    /* creating use case instance */
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const postComment = new PostComment(request, userId);
    const postedComment = await addCommentUseCase.execute(request, userId);

    // Assert
    expect(postedComment).toStrictEqual(expectedPostedComment);
    expect(mockThreadRepository.verifyThreadById).toBeCalledWith(request.params.threadId);
    expect(mockCommentRepository.addComment).toBeCalledWith(postComment);
  });
});
