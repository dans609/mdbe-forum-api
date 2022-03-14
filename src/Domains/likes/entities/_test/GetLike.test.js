const GetLike = require('../GetLike');

describe('GetLike entities', () => {
  const generateResponse = () => ([
    { id: 'like-123', comment_id: 'comment-123' },
    { id: 'like-abc', comment_id: 'comment-123' },
    { id: 'like-def', comment_id: 'comment-123' },
  ]);

  it('should throw error when responses is Falsy', () => {
    expect(() => new GetLike(undefined))
      .toThrowError('GET_LIKE.RESPONSES_IS_FALSY');
  });

  it('should throw error when responses not meet data type specification', () => {
    expect(() => new GetLike({}))
      .toThrowError('GET_LIKE.RESPONSES_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error when responses element isn\'t object', () => {
    const responses = generateResponse();
    responses[2] = true;

    // Action ans Assert
    expect(() => new GetLike(responses))
      .toThrowError('GET_LIKE.RESPONSES_ELEMENT_IS_NOT_OBJECT');
  });

  it('should throw error when responses element not contain needed property', () => {
    const responses = generateResponse();
    delete responses[1].id;

    // Action and Assert
    expect(() => new GetLike(responses))
      .toThrowError('GET_LIKE.RESPONSES_ELEMENT_NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when property of responses element not meet data type specification', () => {
    const responses = generateResponse();
    responses[0].comment_id = [];
    responses[1].id = true;

    // Action and Assert
    expect(() => new GetLike(responses))
      .toThrowError('GET_LIKE.PROPERTY_OF_RESPONSES_ELEMENT_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should get like object correctly', () => {
    const responses = generateResponse();
    const expectedResponses = generateResponse();

    // Action
    const getLike = new GetLike(responses);

    // Assert
    expect(getLike).toBeInstanceOf(GetLike);
    expect(getLike.likeCount).toStrictEqual(3);
    expect(typeof getLike.likeCount).toStrictEqual('number');
    expect(getLike).toStrictEqual(new GetLike(expectedResponses));
  });
});
