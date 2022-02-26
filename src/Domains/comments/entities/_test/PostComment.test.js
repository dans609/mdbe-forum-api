const PostComment = require('../PostComment');

describe('a postComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const params = { threadId: 'thread-123' };
    const userId = 'user-123';

    // Action and Assert
    expect(() => new PostComment({ params }, userId)).toThrowError('POST_COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = { content: true };
    const params = { threadId: 'thread-123' };
    const userId = 'user-123';

    // Action and Assert
    expect(() => new PostComment({ payload, params }, userId)).toThrowError('POST_COMMENT.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error when params did not contain needed property', () => {
    const payload = { content: 'Content dari komentar' };
    const userId = 'user-123';

    // Action and Assert
    expect(() => new PostComment({ payload }, userId)).toThrowError('POST_COMMENT.PARAMS_NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when headers did not contain needed property', () => {
    const payload = { content: 'Content dari komentar' };
    const params = { threadId: 'thread-123' };

    // Action and Assert
    expect(() => new PostComment({ payload, params }, undefined)).toThrowError('POST_COMMENT.HEADERS_NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when headers did not meet data type specification', () => {
    const payload = { content: 'Content dari komentar' };
    const params = { threadId: 'thread-123' };
    const userId = 25;

    // Action and Assert
    expect(() => new PostComment({ payload, params }, userId)).toThrowError('POST_COMMENT.HEADERS_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should post comment object correctly', () => {
    // Arrange
    const payload = { content: 'Content dari komentar' };
    const params = { threadId: 'thread-123' };
    const userId = 'user-123';

    // Action
    const postComment = new PostComment({ payload, params }, userId);

    // Assert
    expect(postComment).toMatchObject({
      content: payload.content,
      threadId: params.threadId,
      userId,
    });
  });
});
