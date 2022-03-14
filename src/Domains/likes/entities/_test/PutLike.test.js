const PutLike = require('../PutLike');

describe('PutLike entities', () => {
  const generateRequest = () => ({
    userId: 'user-123',
    params: {
      threadId: 'thread-123',
      commentId: 'comment-123',
    },
  });

  it('should throw error when params not contain needed property', () => {
    expect(() => new PutLike({}, 'user-123'))
      .toThrowError('PUT_LIKE.PARAMS_NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when credentials is not valid', () => {
    const req = generateRequest();
    delete req.userId;

    // Action and Assert
    expect(() => new PutLike(req.params, req.userId))
      .toThrowError('PUT_LIKE.HEADERS_NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when credentials is not meet data type specification', () => {
    const req = generateRequest();
    req.userId = [];

    // Action and Assert
    expect(() => new PutLike(req.params, req.userId))
      .toThrowError('PUT_LIKE.HEADERS_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should take put like request object correctly', () => {
    // Arrange
    const { params, userId } = generateRequest();

    // Action
    const putLike = new PutLike(params, userId);

    // Assert
    expect(putLike.threadId).toEqual('thread-123');
    expect(putLike.commentId).toEqual('comment-123');
    expect(putLike.userId).toEqual('user-123');
  });
});
