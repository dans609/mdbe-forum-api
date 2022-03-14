const PutLike = require('../../../Domains/likes/entities/PutLike');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const PutLikeUseCase = require('../PutLikeUseCase');

describe('PutLikeUseCase', () => {
  const generateRequest = () => ({
    userId: 'user-123',
    params: { threadId: 'thread-123', commentId: 'comment-123' },
    mock: {
      like: new LikeRepository(),
      thread: new ThreadRepository(),
      comment: new CommentRepository(),
    },
  });

  it('should orchestrating ADD like action correctly', async () => {
    // Arrange
    const { params, userId, mock } = generateRequest();

    /* create dependency for the use case */
    const mockLikeRepository = mock.like;
    const mockThreadRepository = mock.thread;
    const mockCommentRepository = mock.comment;

    /* mocking needed function */
    mockThreadRepository.verifyThreadById = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentByThreadId = jest.fn(() => Promise.resolve());
    mockLikeRepository.verifyLikeAvailability = jest.fn(() => Promise.resolve(false));
    mockLikeRepository.addLike = jest.fn(() => Promise.resolve());
    mockLikeRepository.deleteLike = jest.fn(() => Promise.resolve());

    /* create like usecase instance */
    const putLikeUseCase = new PutLikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    const putLike = new PutLike(params, userId);
    await putLikeUseCase.execute(params, userId);

    // Assert
    /** @DELETE action must not to be called */
    expect(mockLikeRepository.deleteLike).not.toBeCalled();
    expect(mockThreadRepository.verifyThreadById).toBeCalledWith(putLike.threadId);
    expect(mockCommentRepository.verifyCommentByThreadId).toBeCalledWith(putLike);
    expect(mockLikeRepository.verifyLikeAvailability).toBeCalledWith(putLike);
    expect(mockLikeRepository.addLike).toBeCalledWith(putLike);
  });

  it('should orchestrating DELETE like action correctly', async () => {
    // Arrange
    const { params, userId, mock } = generateRequest();

    /* create dependency for the use case */
    const mockLikeRepository = mock.like;
    const mockThreadRepository = mock.thread;
    const mockCommentRepository = mock.comment;

    /* mocking needed function */
    mockThreadRepository.verifyThreadById = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentByThreadId = jest.fn(() => Promise.resolve());
    mockLikeRepository.verifyLikeAvailability = jest.fn(() => Promise.resolve(true));
    mockLikeRepository.addLike = jest.fn(() => Promise.resolve());
    mockLikeRepository.deleteLike = jest.fn(() => Promise.resolve());

    /* create like usecase instance */
    const putLikeUseCase = new PutLikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    const putLike = new PutLike(params, userId);
    await putLikeUseCase.execute(params, userId);

    // Assert
    /** @ADD action must not to be called */
    expect(mockLikeRepository.addLike).not.toBeCalled();
    expect(mockThreadRepository.verifyThreadById).toBeCalledWith(putLike.threadId);
    expect(mockCommentRepository.verifyCommentByThreadId).toBeCalledWith(putLike);
    expect(mockLikeRepository.verifyLikeAvailability).toBeCalledWith(putLike);
    expect(mockLikeRepository.deleteLike).toBeCalledWith(putLike);
  });
});
