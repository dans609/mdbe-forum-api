const PostThread = require('../../../Domains/threads/entities/PostThread');
const PostedThread = require('../../../Domains/threads/entities/PostedThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');
const AddThreadUseCase = require('../AddThreadUseCase');

describe('AddThreadUseCase', () => {
  it('should orchestrating the add thread action correctly', async () => {
    // Arrange
    const useCasePayload = { title: 'Thread Title', body: 'Thread body' };
    const useCaseHeaders = { authorization: 'Bearer token-123' };
    const expectedPostedThread = new PostedThread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner: 'user-123',
    });

    /* creating dependency for the use case */
    const mockThreadRepository = new ThreadRepository();
    const mockAuthManager = new AuthenticationTokenManager();

    /* mocking needed function of the dependency */
    mockThreadRepository.addThread = jest.fn()
      .mockImplementation(() => Promise.resolve(new PostedThread({
        id: 'thread-123',
        title: 'Thread Title',
        owner: 'user-123',
      })));
    mockAuthManager.getTokenByHeaders = jest.fn()
      .mockImplementation(() => Promise.resolve('token-123'));
    mockAuthManager.decodePayload = jest.fn()
      .mockImplementation(() => Promise.resolve({ id: expectedPostedThread.owner, username: 'dicoding' }));

    /* creating use case instance */
    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
      authTokenManager: mockAuthManager,
    });

    // Action
    const postThread = new PostThread({ ...useCasePayload }, useCaseHeaders.authorization);
    const postedThread = await addThreadUseCase.execute(
      useCasePayload, useCaseHeaders.authorization,
    );

    // Assert
    expect(postedThread).toStrictEqual(expectedPostedThread);
    expect(mockAuthManager.getTokenByHeaders).toBeCalledWith(useCaseHeaders.authorization);
    expect(mockAuthManager.decodePayload).toBeCalledWith('token-123');
    expect(mockThreadRepository.addThread).toBeCalledWith({
      ...postThread, owner: expectedPostedThread.owner,
    });
  });
});
