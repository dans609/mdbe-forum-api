const DeleteComment = require('../DeleteComment');

describe('a deleteComment entities', () => {
  const generateRequest = () => ({
    params: { threadId: 'thread-123', commentId: 'comment-123' },
    headers: { authorization: 'Bearer token-123', missTypeAuth: true },
  });

  it('should throw error when params did not contain needed property', () => {
    // Arrange
    const { headers } = generateRequest();

    // Action and Assert
    expect(() => new DeleteComment({}, headers.authorization))
      .toThrowError('DELETE_COMMENT.PARAMS_NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when headers did not contain needed property', () => {
    // Arrange
    const { params } = generateRequest();

    // Action and Assert
    expect(() => new DeleteComment({ ...params }, NaN))
      .toThrowError('DELETE_COMMENT.HEADERS_NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when headers did not meet data type specification', () => {
    // Arrange
    const { params, headers } = generateRequest();

    // Action and Assert
    expect(() => new DeleteComment({ ...params }, headers.missTypeAuth))
      .toThrowError('DELETE_COMMENT.HEADERS_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should take delete comment request object correctly', () => {
    // Arrange
    const { params, headers } = generateRequest();

    // Action
    const requestObject = new DeleteComment({ ...params }, headers.authorization);

    // Assert
    expect(requestObject).toMatchObject({
      ...params,
      authToken: headers.authorization,
    });
  });
});
