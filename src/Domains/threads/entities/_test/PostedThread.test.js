const PostedThread = require('../PostedThread');

describe('a PostedThread entities', () => {
  it('should throw error when responses did not contain needed property', () => {
    // Arrange
    const responses = { id: 'thread-123', title: 'Thread Title' };

    // Action and Assert
    expect(() => new PostedThread(responses)).toThrowError('POSTED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when responses did not meet data type specification', () => {
    // Arrange
    const responses = { id: true, title: 99, owner: 'user-123' };

    // Action and Assert
    expect(() => new PostedThread(responses)).toThrowError('POSTED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create postedThread object correctly', () => {
    // Arrange
    const responses = { id: 'thread-123', title: 'Thread Title', owner: 'user-123' };

    // Action
    const { id, title, owner } = new PostedThread(responses);

    // Assert
    expect(id).toEqual(responses.id);
    expect(title).toEqual(responses.title);
    expect(owner).toEqual(responses.owner);
  });
});
