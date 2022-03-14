const PostedThread = require('../PostedThread');

describe('a PostedThread entities', () => {
  const generateReponses = () => ({
    id: 'thread-123',
    title: 'Thread Title',
    owner: 'user-123',
  });

  it('should throw error when responses did not contain needed property', () => {
    // Arrange
    const responses = generateReponses();
    delete responses.owner;

    // Action and Assert
    expect(() => new PostedThread(responses))
      .toThrowError('POSTED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when responses did not meet data type specification', () => {
    // Arrange
    const responses = generateReponses();
    responses.id = true;

    // Action and Assert
    expect(() => new PostedThread(responses))
      .toThrowError('POSTED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create postedThread object correctly', () => {
    // Arrange
    /* duplicating data, to avoid Action affecting the value during its processes */
    const responses = generateReponses();
    const expectedResponses = generateReponses();

    // Action
    const postedThread = new PostedThread(responses);

    // Assert
    expect(postedThread).toMatchObject(expectedResponses);
    expect(postedThread).toStrictEqual(new PostedThread(expectedResponses));
  });
});
