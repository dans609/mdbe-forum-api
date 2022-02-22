const DetailComment = require('../DetailComment');

describe('a DetailComment entities', () => {
  describe('covered line needs and guarantee stuff security', () => {
    it('allow all keys object enter the entity, but required keys must enter the entity', () => {
      const anyKeys = { threadId: 'thread-123', threadTitle: 'Thread Title', any: true };
      const requiredKeys = {
        id: 'comment-123',
        content: 'sebuah komentar',
        username: 'dicoding',
        date: '12-30-2022',
        is_deleted: true,
      };

      // Action
      const detailComment = new DetailComment({ ...requiredKeys, ...anyKeys });

      // Assert
      expect(detailComment.id).toBeDefined();
      expect(detailComment.any).toBeUndefined();
      expect(detailComment.username).toBeDefined();
      expect(detailComment.threadId).toBeUndefined();
      expect(detailComment.threadTitle).toBeUndefined();
    });
  });

  it('don\'t let is_deleted be a property of DetailComment entities', () => {
    const requiredKeys = {
      id: 'comment-123',
      content: 'sebuah komentar',
      username: 'dicoding',
      date: '12-30-2022',
      is_deleted: false,
    };

    // Action and Assert
    const detailComment = new DetailComment(requiredKeys);
    expect(detailComment.is_deleted).toBeUndefined();
  });

  it('should throw error when responses not contain needed property', () => {
    // Arrange
    const responses = {
      id: 'comment-123',
      date: '12-29-2020',
      content: 'Content dari komentar',
      username: 'dicoding',
    };

    // Action and Assert
    expect(() => new DetailComment(responses))
      .toThrowError('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when responses not meet data type specification', () => {
    const fkResponse = { username: {} };
    const responses = {
      id: 42,
      date: '12-29-2022',
      content: true,
      is_deleted: false,
    };

    // Action and Assert
    expect(() => new DetailComment({ ...responses, ...fkResponse }))
      .toThrowError('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error when is_deleted response not meet data type specification', () => {
    const fkResponse = { username: 'dicoding' };
    const response = {
      id: 'comment-123',
      date: '12-29-2022',
      content: 'sebuah komentar',
      is_deleted: {},
    };

    // Action and Assert
    expect(() => new DetailComment({ ...response, ...fkResponse }))
      .toThrowError('DETAIL_COMMENT.IS_DELETED_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create detailComments object correctly', () => {
    // Arrange
    const comment = {
      first: {
        id: 'comment-123',
        content: 'sebuah komentar',
        date: '12-29-2020',
        username: 'dicoding',
        is_deleted: false,
      },
      second: {
        id: 'comment-abc',
        content: '**komentar telah dihapus**',
        date: '12-30-2020',
        username: 'johndoe',
        is_deleted: true,
      },
    };

    // Action
    const firstComment = new DetailComment(comment.first);
    const secondComment = new DetailComment(comment.second);

    // Assert
    expect(firstComment).toStrictEqual(new DetailComment({ ...comment.first }));
    expect(secondComment).toStrictEqual(new DetailComment({ ...comment.second }));
  });
});
