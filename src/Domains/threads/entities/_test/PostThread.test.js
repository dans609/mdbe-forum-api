const PostThread = require('../PostThread');

describe('a PostThread entities', () => {
  const generateRequest = () => ({
    payload: { title: 'Thread Title', body: 'Thread body' },
    userId: 'user-123',
  });

  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const { payload, userId } = generateRequest();
    delete payload.body;

    // Action and Assert
    expect(() => new PostThread(payload, userId))
      .toThrowError('POST_THREAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const { payload, userId } = generateRequest();
    payload.title = 17;

    // Action and Assert
    expect(() => new PostThread(payload, userId))
      .toThrowError('POST_THREAD.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error when headers did not contain needed property', () => {
    // Arrange
    const { payload } = generateRequest();

    // Action and Assert
    expect(() => new PostThread(payload, undefined))
      .toThrowError('POST_THREAD.HEADERS_NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when headers did not meet data type specification', () => {
    // Arrange
    const request = generateRequest();
    request.userId = true;

    // Action and Assert
    expect(() => new PostThread(request.payload, request.userId))
      .toThrowError('POST_THREAD.HEADERS_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should post thread object correctly', () => {
    // Arrange
    const { payload, userId } = generateRequest();
    const { payload: expectedPayload, userId: expectedUserId } = generateRequest();

    // Action
    const postThread = new PostThread(payload, userId);

    // Assert
    expect(postThread).toMatchObject({ ...expectedPayload, userId: expectedUserId });
    expect(postThread).toStrictEqual(new PostThread(expectedPayload, expectedUserId));
  });
});
