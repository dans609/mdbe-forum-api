const RegisterUser = require('../RegisterUser');

describe('a RegisterUser entities', () => {
  const generateRequest = () => ({
    username: 'dicoding',
    fullname: 'Dicoding Indonesia',
    password: 'abc',
  });

  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = generateRequest();
    delete payload.fullname;

    // Action and Assert
    expect(() => new RegisterUser(payload))
      .toThrowError('REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = generateRequest();
    payload.username = 123;
    payload.fullname = true;

    // Action and Assert
    expect(() => new RegisterUser(payload))
      .toThrowError('REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error when username contains more than 50 character', () => {
    // Arrange
    const payload = generateRequest();
    payload.username = 'dicodingindonesiadicodingindonesiadicodingindonesiadicoding';

    // Action and Assert
    expect(() => new RegisterUser(payload))
      .toThrowError('REGISTER_USER.USERNAME_LIMIT_CHAR');
  });

  it('should throw error when username contains restricted character', () => {
    // Arrange
    const payload = generateRequest();
    payload.username = 'dico ding';

    // Action and Assert
    expect(() => new RegisterUser(payload))
      .toThrowError('REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER');
  });

  it('should create registerUser object correctly', () => {
    // Arrange
    const payload = generateRequest();

    // Action
    const { username, fullname, password } = new RegisterUser(payload);

    // Assert
    expect(username).toEqual(payload.username);
    expect(fullname).toEqual(payload.fullname);
    expect(password).toEqual(payload.password);
  });
});
