const PostThread = require('../../../Domains/threads/entities/PostThread');
const PostedThread = require('../../../Domains/threads/entities/PostedThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddThreadUseCase = require('../AddThreadUseCase');

describe('AddThreadUseCase', () => {
  it('should orchestrating the add thread action correctly', async () => {
    // Arrange
    const useCasePayload = { title: 'Thread Title', body: 'Thread body' };
    const useCaseUserId = 'user-123';
    const expectedPostedThread = new PostedThread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner: useCaseUserId,
    });

    /* creating dependency for the use case */
    const mockThreadRepository = new ThreadRepository();

    /* mocking needed function of the dependency */
    mockThreadRepository.addThread = jest.fn()
      .mockImplementation(() => Promise.resolve(new PostedThread({
        id: 'thread-123',
        title: 'Thread Title',
        owner: 'user-123',
      })));

    /* creating use case instance */
    const addThreadUseCase = new AddThreadUseCase(mockThreadRepository);

    // Action
    const postThread = new PostThread(useCasePayload, useCaseUserId);
    const postedThread = await addThreadUseCase.execute(useCasePayload, useCaseUserId);

    // Assert
    expect(postedThread).toStrictEqual(expectedPostedThread);
    expect(mockThreadRepository.addThread).toBeCalledWith({ ...postThread });
  });
});
