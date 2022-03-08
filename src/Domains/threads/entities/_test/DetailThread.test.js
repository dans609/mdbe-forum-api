const DetailThread = require('../DetailThread');

describe('a DetailThread entities', () => {
  describe('simplify needs', () => {
    it('should allow any keys object to enter the entity, but must still put required keys', () => {
      const anyKeys = { commentId: 'comment-123', userId: 'user-123', any: true };
      const requiredKeys = {
        id: 'thread-123',
        title: 'Thread Title',
        body: 'Thread body',
        date: '12-30-2022',
        username: 'dicoding',
      };

      // Action
      const detailThread = new DetailThread({ ...requiredKeys, ...anyKeys });

      // Assert
      expect(detailThread.id).toBeDefined();
      expect(detailThread.any).toBeUndefined();
      expect(detailThread.username).toBeDefined();
      expect(detailThread.userId).toBeUndefined();
      expect(detailThread.commentId).toBeUndefined();
    });
  });

  it('should throw error when responses did not contain needed property', () => {
    // Arrange
    const responses = {
      id: 'thread-123',
      title: 'Thread Title',
      body: 'Thread body',
      date: '12-29-2022',
    };

    // Action and Assert
    expect(() => new DetailThread(responses))
      .toThrowError('DETAIL_THREAD.RESPONSES_NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when responses did not meet data type specification', () => {
    // Arrange
    const fkResponse = { username: 'dicoding' };
    const responses = {
      id: true,
      title: 421,
      body: 'Thread body',
      date: '12-29-2022',
    };

    // Action and Assert
    expect(() => new DetailThread({ ...responses, ...fkResponse }))
      .toThrowError('DETAIL_THREAD.RESPONSES_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create detailedThread object correctly', () => {
    const fkResponse = { username: 'dicoding' };
    const responses = {
      id: 'thread-123',
      title: 'Thread Title',
      body: 'Thread body',
      date: '12-29-2022',
    };

    // Action
    const detailThread = new DetailThread({
      ...responses, ...fkResponse,
    });

    // Assert
    expect(detailThread).toMatchObject({
      ...responses,
      ...fkResponse,
    });
  });
});
