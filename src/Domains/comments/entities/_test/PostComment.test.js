const PostComment = require('../PostComment');

describe('a postComment entities', () => {
  const generateRequest = () => ({
    userId: 'user-123',
    request: {
      payload: { content: 'Content dari komentar' },
      params: { threadId: 'thread-123' },
    },
  });

  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const { request, userId } = generateRequest();
    delete request.payload;

    // Action and Assert
    expect(() => new PostComment(request, userId))
      .toThrowError('POST_COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const { request, userId } = generateRequest();
    request.payload.content = true;

    // Action and Assert
    expect(() => new PostComment(request, userId))
      .toThrowError('POST_COMMENT.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error when params did not contain needed property', () => {
    const { request, userId } = generateRequest();
    delete request.params;

    // Action and Assert
    expect(() => new PostComment(request, userId))
      .toThrowError('POST_COMMENT.PARAMS_NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when headers did not contain needed property', () => {
    const { request } = generateRequest();

    // Action and Assert
    expect(() => new PostComment(request, undefined))
      .toThrowError('POST_COMMENT.HEADERS_NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when headers did not meet data type specification', () => {
    const req = generateRequest();
    req.userId = 25;

    // Action and Assert
    expect(() => new PostComment(req.request, req.userId))
      .toThrowError('POST_COMMENT.HEADERS_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should post comment object correctly', () => {
    // Arrange
    /* duplicating data, to avoid Action affecting the value during its processes */
    const req = generateRequest();
    const { request: expectedReq, userId: expectedUserId } = generateRequest();

    // Action
    const postComment = new PostComment(req.request, req.userId);

    // Assert
    expect(postComment).toMatchObject({
      content: expectedReq.payload.content,
      threadId: expectedReq.params.threadId,
      userId: expectedUserId,
    });
    expect(postComment).toStrictEqual(new PostComment(expectedReq, expectedUserId));
  });
});
