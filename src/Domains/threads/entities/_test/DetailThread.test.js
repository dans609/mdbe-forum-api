const DetailThread = require('../DetailThread');

describe('a DetailThread entities', () => {
  const generateResponse = () => ({
    thread: {
      id: 'thread-123',
      title: 'Thread Title',
      body: 'Thread body',
      date: '12-30-2022',
      username: 'dicoding',
    },
  });

  describe('simplify needs', () => {
    it('should allow any keys object to enter the entity, but must still put required keys', () => {
      const responses = generateResponse().thread;
      responses.any = true;
      responses.userId = 'user-123';

      // Action
      const detailThread = new DetailThread(responses);

      // Assert
      expect(detailThread.id).toBeDefined();
      expect(detailThread.any).toBeUndefined();
      expect(detailThread.body).toBeDefined();
      expect(detailThread.userId).toBeUndefined();
    });
  });

  it('should throw error when responses did not contain needed property', () => {
    // Arrange
    const responses = generateResponse().thread;
    delete responses.date;

    // Action and Assert
    expect(() => new DetailThread(responses))
      .toThrowError('DETAIL_THREAD.RESPONSES_NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when responses did not meet data type specification', () => {
    // Arrange
    const responses = generateResponse().thread;
    responses.username = 1;

    // Action and Assert
    expect(() => new DetailThread(responses))
      .toThrowError('DETAIL_THREAD.RESPONSES_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create detailedThread object correctly', () => {
    // Arrange
    /* duplicating data, to avoid Action affecting the value during its processes */
    const { thread: responsesThread } = generateResponse();
    const { thread: expectedThread } = generateResponse();

    // Action
    const detailThread = new DetailThread(responsesThread);

    // Assert
    expect(detailThread).toStrictEqual(new DetailThread(expectedThread));
    expect(detailThread).toMatchObject(expectedThread);
  });
});
