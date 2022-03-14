const UserLogin = require('../UserLogin');

describe('UserLogin entities', () => {
  const generateRequest = () => ({
    username: 'dicoding',
    password: '12345',
  });

  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = generateRequest();
    delete payload.password;

    // Action & Assert
    expect(() => new UserLogin(payload))
      .toThrowError('USER_LOGIN.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = generateRequest();
    payload.password = 12345;

    // Action & Assert
    expect(() => new UserLogin(payload))
      .toThrowError('USER_LOGIN.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create UserLogin entities correctly', () => {
    // Arrange
    const payload = generateRequest();

    // Action
    const userLogin = new UserLogin(payload);

    // Assert
    expect(userLogin).toBeInstanceOf(UserLogin);
    expect(userLogin.username).toEqual(payload.username);
    expect(userLogin.password).toEqual(payload.password);
  });
});
