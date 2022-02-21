const PostThread = require('../PostThread');

describe('a PostThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = { title: 'Thread Title' };
    const headers = { authorization: 'Bearer token-123' };

    // Action and Assert
    expect(() => new PostThread(payload, headers)).toThrowError('POST_THREAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
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
    const headers = { authorization: true };

    // Action and Assert
    expect(() => new PostThread(payload, headers.authorization)).toThrowError('POST_THREAD.HEADERS_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should post thread object correctly', () => {
    // Arrange
    const payload = { title: 'Thread Title', body: 'Thread body' };
    const headers = { authorization: 'Bearer token-123' };

    // Action
    const { title, body, authToken } = new PostThread(payload, headers.authorization);

    // Assert
    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(authToken).toEqual(headers.authorization);
  });
});
