const GetThread = require('../../../Domains/threads/entities/GetThread');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const GetThreadUseCase = require('../GetThreadUseCase');

describe('GetThreadUseCase', () => {
  const getObject = (params) => ({
    thread: {
      id: params.threadId,
      title: 'Thread Title',
      body: 'Thread body',
      date: '12-29-2022',
      username: 'dicoding',
    },
    comments: {
      first: {
        id: 'comment-abc',
        username: 'dicoding',
        date: '12-29-2022',
        content: 'Content dari komentar',
      },
      second: {
        id: 'comment-123',
        username: 'johndoe',
        date: '12-30-2022',
        content: 'sebuah comment',
      },
    },
  });

  it('should orchestrating the get action correctly', async () => {
    // Arrange
    const params = { threadId: 'thread-123' };
    const { thread, comments } = getObject(params);

    /* create entities instance */
    const detailThread = new DetailThread(thread);
    const commentsInThread = [
      new DetailComment({ ...comments.first, is_deleted: true }),
      new DetailComment({ ...comments.second, is_deleted: false }),
    ];

    /* create object that contain expected return value from use case */
    const expectedDetailedThread = { detailThread, commentsInThread };

    /* create dependency for the use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /* mocking the needed function */
    mockThreadRepository.verifyThreadById = jest.fn(() => Promise.resolve());
    mockThreadRepository.getThreadById = jest.fn(() => Promise.resolve(new DetailThread({
      id: params.threadId,
      title: 'Thread Title',
      body: 'Thread body',
      date: '12-29-2022',
      username: 'dicoding',
    })));
    mockCommentRepository.getCommentsByThreadId = jest.fn(() => Promise.resolve([
      new DetailComment({
        id: 'comment-abc',
        username: 'dicoding',
        date: '12-29-2022',
        content: 'Content dari komentar',
        is_deleted: true,
      }),
      new DetailComment({
        id: 'comment-123',
        username: 'johndoe',
        date: '12-30-2022',
        content: 'sebuah comment',
        is_deleted: false,
      }),
    ]));

    /* creating use case instance */
    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const { threadId } = new GetThread(params);
    const detailedThread = await getThreadUseCase.execute(params);

    // Assert
    expect(threadId).toEqual(params.threadId);
    expect(detailedThread).toStrictEqual(expectedDetailedThread);
    expect(mockThreadRepository.verifyThreadById).toBeCalledWith(threadId);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(threadId);
  });
});
