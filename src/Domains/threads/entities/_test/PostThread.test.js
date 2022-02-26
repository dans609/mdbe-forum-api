const PostThread = require('../PostThread');

describe('a PostThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = { title: 'Thread Title' };
    const userId = 'user-123';

    // Action and Assert
    expect(() => new PostThread(payload, userId)).toThrowError('POST_THREAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when headers did not contain needed property', () => {
    // Arrange
    const payload = { title: 'Thread Title', body: 'Thread body' };

    // Action and Assert
    expect(() => new PostThread(payload, undefined)).toThrowError('POST_THREAD.HEADERS_NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = { title: 123, body: true };

    // Action and Assert
    expect(() => new PostThread(payload, {})).toThrowError('POST_THREAD.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error when headers did not meet data type specification', () => {
    // Arrange
    const payload = { title: 'Thread Title', body: 'Thread body' };
    const userId = true;

    // Action and Assert
    expect(() => new PostThread(payload, userId)).toThrowError('POST_THREAD.HEADERS_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should post thread object correctly', () => {
    // Arrange
    const payload = { title: 'Thread Title', body: 'Thread body' };
    const auth = { credentials: { id: 'user-123' } };

    // Action
    const { title, body, userId } = new PostThread(payload, auth.credentials.id);

    // Assert
    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(userId).toEqual(auth.credentials.id);
  });
});
