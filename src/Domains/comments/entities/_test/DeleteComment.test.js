const DeleteComment = require('../DeleteComment');

describe('a deleteComment entities', () => {
  const generateRequest = () => ({
    params: { threadId: 'thread-123', commentId: 'comment-123' },
    userId: 'user-123',
  });

  it('should throw error when params did not contain needed property', () => {
    // Arrange
    const { params, userId } = generateRequest();
    delete params.commentId;

    // Action and Assert
    expect(() => new DeleteComment(params, userId))
      .toThrowError('DELETE_COMMENT.PARAMS_NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when headers did not contain needed property', () => {
    // Arrange
    const { params } = generateRequest();

    // Action and Assert
    expect(() => new DeleteComment(params, undefined))
      .toThrowError('DELETE_COMMENT.HEADERS_NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when headers did not meet data type specification', () => {
    // Arrange
    const { params } = generateRequest();

    // Action and Assert
    expect(() => new DeleteComment(params, 420))
      .toThrowError('DELETE_COMMENT.HEADERS_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should take delete comment request object correctly', () => {
    // Arrange
    /* duplicating data, to avoid Action affecting the value during its processes */
    const { params, userId } = generateRequest();
    const { params: expectedParams, userId: expectedUserId } = generateRequest();

    // Action
    const deleteCommentEntity = new DeleteComment(params, userId);

    // Assert
    expect(deleteCommentEntity).toMatchObject({ ...expectedParams, userId: expectedUserId });
    expect(deleteCommentEntity).toStrictEqual(new DeleteComment(expectedParams, expectedUserId));
  });
});
