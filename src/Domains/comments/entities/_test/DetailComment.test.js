const DetailComment = require('../DetailComment');

describe('a DetailComment entities', () => {
  const generateResponse = () => ({
    comment: {
      first: {
        id: 'comment-123',
        content: 'sebuah komentar',
        date: '12-29-2022',
        username: 'dicoding',
      },
      second: {
        id: 'comment-abc',
        content: 'Content dari komentar',
        date: '12-30-2022',
        username: 'johndoe',
      },
    },
  });

  describe('simplify need', () => {
    it('allow all keys object enter the entity, but required keys must exists', () => {
      const responses = generateResponse().comment.first;
      responses.is_deleted = true;
      responses.body = 'Thread body';
      responses.any = {};

      // Action
      const detailComment = new DetailComment(responses);

      // Assert
      expect(detailComment.id).toBeDefined();
      expect(detailComment.date).toBeDefined();
      expect(detailComment.any).toBeUndefined();
      expect(detailComment.body).toBeUndefined();
    });
  });

  it('don\'t let is_deleted be a property of DetailComment entity', () => {
    const responses = generateResponse().comment.first;
    responses.is_deleted = false;

    // Action
    const detailComment = new DetailComment(responses);

    // Assert
    expect(detailComment.is_deleted).toBeUndefined();
  });

  it('should throw error when responses not contain needed property', () => {
    // Arrange
    const responses = generateResponse().comment.first;

    // Action and Assert
    expect(() => new DetailComment(responses))
      .toThrowError('DETAIL_COMMENT.RESPONSES_NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when responses not meet data type specification', () => {
    const responses = generateResponse().comment.first;
    responses.is_deleted = true;
    responses.date = 2020;

    // Action and Assert
    expect(() => new DetailComment(responses))
      .toThrowError('DETAIL_COMMENT.RESPONSES_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error when is_deleted response not meet data type specification', () => {
    const responses = generateResponse().comment.first;
    responses.is_deleted = [];

    // Action and Assert
    expect(() => new DetailComment(responses))
      .toThrowError('DETAIL_COMMENT.PROPERTY_IS_DELETED_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create detailComments object correctly for deleted comment', () => {
    // Arrange
    const isDeleted = true;

    /* duplicating data, to avoid Action affecting the value during its processes */
    const { comment } = generateResponse();
    const { comment: expected } = generateResponse();

    // Action
    const firstComment = new DetailComment({ ...comment.first, is_deleted: isDeleted });
    const secondComment = new DetailComment({ ...comment.second, is_deleted: isDeleted });

    // Assert
    const deletedContent = '**komentar telah dihapus**';
    expect(firstComment).toMatchObject({ ...expected.first, content: deletedContent });
    expect(firstComment).toStrictEqual(new DetailComment({
      ...expected.first, is_deleted: isDeleted,
    }));

    expect(secondComment).toMatchObject({ ...expected.second, content: deletedContent });
    expect(secondComment).toStrictEqual(new DetailComment({
      ...expected.second, is_deleted: isDeleted,
    }));
  });

  it('should create detailComments object correctly for non-deleted comment', () => {
    // Arrange
    const isDeleted = false;

    /* duplicating data, to avoid Action affecting the value during its processes */
    const { comment } = generateResponse();
    const { comment: expected } = generateResponse();

    // Action
    const firstComment = new DetailComment({ ...comment.first, is_deleted: isDeleted });
    const secondComment = new DetailComment({ ...comment.second, is_deleted: isDeleted });

    // Assert
    expect(firstComment).toMatchObject(expected.first);
    expect(firstComment).toStrictEqual(new DetailComment({
      ...expected.first, is_deleted: isDeleted,
    }));

    expect(secondComment).toMatchObject(expected.second);
    expect(secondComment).toStrictEqual(new DetailComment({
      ...expected.second, is_deleted: isDeleted,
    }));
  });
});
