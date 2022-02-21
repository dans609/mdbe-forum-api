const GetThread = require('../GetThread');

describe('a GetThread entities', () => {
  it('should throw error when params not contain needed property', () => {
    expect(() => new GetThread({})).toThrowError('GET_THREAD.PARAMS_NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should take get comment request object correctly', () => {
    // Arrange
    const params = { threadId: 'thread-123' };

    // Action
    const getThread = new GetThread(params);

    // Assert
    expect(getThread.threadId).toEqual(params.threadId);
  });
});
