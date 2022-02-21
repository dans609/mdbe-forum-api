const GetThread = require('../../../Domains/threads/entities/GetThread');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const GetThreadUseCase = require('../GetThreadUseCase');

describe('GetThreadUseCase', () => {
  it('should orchestrating the get action correctly', async () => {
    // Arrange
    const params = { threadId: 'thread-123' };
    const detailThread = new DetailThread({
      id: params.threadId,
      title: 'Thread Title',
      body: 'Thread body',
      date: '12-29-2022',
      username: 'dicoding',
    });
    const commentsInThread = [
      new DetailComment({
        id: 'comment-abc',
        username: 'dicoding',
        date: '12-29-2022',
        content: '**komentar telah dihapus**',
      }),
      new DetailComment({
        id: 'comment-123',
        username: 'john doe',
        date: '12-30-2022',
        content: 'sebuah comment',
      }),
    ];

    const expectedDetailedThread = {
      detailThread, commentsInThread,
    };

    /* creating dependency for the use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /* mocking needed function of the dependency */
    mockThreadRepository.verifyThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(new DetailThread({ ...detailThread })));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([
        new DetailComment({ ...commentsInThread[0] }),
        new DetailComment({ ...commentsInThread[1] }),
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
    expect(detailedThread).toStrictEqual(expectedDetailedThread);
    expect(mockThreadRepository.verifyThreadById).toBeCalledWith(threadId);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(threadId);
  });
});
