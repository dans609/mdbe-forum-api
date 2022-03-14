const PostedComment = require('../PostedComment');
const PostedComments = require('../PostedComment');

describe('a postedComment entities', () => {
  const generateResponses = () => ({
    id: 'comment-123',
    content: 'Content dari kokomentar',
    owner: 'user-123',
  });

  it('should throw error when responses did not contain needed property', () => {
    // Arrange
    const responses = generateResponses();
    delete responses.id;

    // Action and Assert
    expect(() => new PostedComments(responses))
      .toThrowError('POSTED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when responses did not meet data type specification', () => {
    // Arrange
    const responses = generateResponses();
    responses.content = [];

    // Action and Assert
    expect(() => new PostedComments(responses))
      .toThrowError('POSTED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create postedComment correctly', () => {
    // Arrange
    /* duplicating data, to avoid Action affecting the value during its processes */
    const responses = generateResponses();
    const expectedResponses = generateResponses();

    // Action
    const postedComment = new PostedComments(responses);

    // Assert
    expect(postedComment).toMatchObject(expectedResponses);
    expect(postedComment).toStrictEqual(new PostedComment(expectedResponses));
  });
});
