const PostedComments = require('../PostedComment');

describe('a postedComment entities', () => {
  it('should throw error when response did not contain needed property', () => {
    // Arrange
    const response = { content: 'Content dari komentar', owner: 'user-123' };

    // Action and Assert
    expect(() => new PostedComments(response)).toThrowError('POSTED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when response did not meet data type specification', () => {
    // Arrange
    const response = { id: 'comment-123', content: {}, owner: true };

    // Action and Assert
    expect(() => new PostedComments(response)).toThrowError('POSTED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create postedComment correctly', () => {
    // Arrange
    const response = { id: 'comment-123', content: 'Content dari komentar', owner: 'user-123' };

    // Action
    const postedComment = new PostedComments(response);

    // Assert
    expect(postedComment).toMatchObject({ ...response });
  });
});
