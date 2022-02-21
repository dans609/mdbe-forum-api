const DetailComment = require('../DetailComment');

describe('a DetailComment entities', () => {
  describe('covered line needs', () => {
    it('should allow all keys object to enter the entity', () => {
      const anyKeys = { threadId: 'thread-123', threadTitle: 'Thread Title', any: true };
      const requiredKeys = {
        id: 'comment-123',
        content: 'sebuah komentar',
        username: 'dicoding',
        date: '12-30-2022',
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

  it('should throw error when responses not contain needed property', () => {
    // Arrange
    const responses = {
      id: 'comment-123',
      date: '12-29-2020',
      content: 'Content dari komentar',
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
    };

    // Action and Assert
    expect(() => new DetailComment({ ...responses, ...fkResponse }))
      .toThrowError('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create detailComments object correctly', () => {
    // Arrange
    const fkResponses = [{ username: 'dicoding' }, { username: 'johndoe' }];
    const responses = [
      {
        id: 'comment-123',
        content: 'sebuah komentar',
        date: '12-29-2020',
      },
      {
        id: 'comment-abc',
        content: '**komentar telah dihapus**',
        date: '12-30-2020',
      },
    ];

    // Action and Assert
    responses.forEach((response, index) => {
      /* Action */
      const detailComment = new DetailComment({
        ...response,
        ...fkResponses[index],
      });

      /* Assert */
      expect(detailComment).toMatchObject({
        ...response,
        ...fkResponses[index],
      });
    });
  });
});
