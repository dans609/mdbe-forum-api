const GetThread = require('../../../Domains/threads/entities/GetThread');
const GetLike = require('../../../Domains/likes/entities/GetLike');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const GetThreadUseCase = require('../GetThreadUseCase');

describe('GetThreadUseCase', () => {
  const getResponse = () => ({
    thread: {
      id: 'thread-123',
      title: 'Thread Title',
      body: 'Thread body',
      date: '12-29-2022',
      username: 'dicoding',
    },
    comments: {
      id: 'comment-abc',
      username: 'dicoding',
      date: '12-29-2022',
      content: 'Content dari komentar',
    },
    likes: [
      { id: 'like-123-for-comment-abc', comment_id: 'comment-abc' },
      { id: 'like-234-for-comment-abc', comment_id: 'comment-abc' },
      { id: 'like-345-for-comment-abc', comment_id: 'comment-abc' },
    ],
  });

  it('should orchestrating the get action correctly', async () => {
    // Arrange
    const { thread, comments, likes } = getResponse();
    const { thread: cloneThread, comments: cloneComments, likes: cloneLikes } = getResponse();

    /* create entities instance */
    const { likeCount } = new GetLike(likes);
    const detailThread = new DetailThread(thread);
    const commentsInThread = [
      new DetailComment({ ...comments, is_deleted: true }),
    ];

    /* create object that contain expected return value from use case */
    const detailComments = commentsInThread.map((comment) => ({ ...comment, likeCount }));
    const expectedDetailedThread = { ...detailThread, comments: detailComments };

    /* create dependency for the use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    /* mocking the needed function */
    mockThreadRepository.verifyThreadById = jest.fn(() => Promise.resolve());
    mockLikeRepository.getLikesInComment = jest.fn(() => Promise.resolve(new GetLike(cloneLikes)));
    mockThreadRepository.getThreadById = jest.fn(() => Promise.resolve(
      new DetailThread(cloneThread),
    ));
    mockCommentRepository.getCommentsByThreadId = jest.fn(() => Promise.resolve([
      new DetailComment({ ...cloneComments, is_deleted: true }),
    ]));

    /* creating use case instance */
    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    const params = { threadId: thread.id };
    const { threadId } = new GetThread(params);
    const detailedThread = await getThreadUseCase.execute(params);

    // Assert
    expect(threadId).toEqual(thread.id);
    expect(detailedThread).toStrictEqual(expectedDetailedThread);
    expect(mockThreadRepository.verifyThreadById).toBeCalledWith(threadId);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(threadId);
    expect(mockLikeRepository.getLikesInComment).toBeCalledWith('comment-abc');
  });
});
