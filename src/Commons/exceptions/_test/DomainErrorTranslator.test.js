const DomainErrorTranslator = require('../DomainErrorTranslator');
const AuthenticationError = require('../AuthenticationError');
const InvariantError = require('../InvariantError');

describe('DomainErrorTranslator', () => {
  function ermapRegister(map, errors) {
    errors.forEach((e) => {
      map.set(e.message, e.translate);
    });

    return map;
  }

  it('should return original error when error message is not needed to translate', () => {
    // Arrange
    const error = new Error('some_error_message');

    // Action and Assert
    expect(DomainErrorTranslator.translate(error)).toStrictEqual(error);
  });

  it('should translate error correctly', () => {
    // Arrange
    /* registering domain error message and its translated message */
    const authenticationErrorMessage = [
      {
        message: 'POST_THREAD.HEADERS_NOT_CONTAIN_NEEDED_PROPERTY',
        translate: 'Missing authentication',
      },
      {
        message: 'POST_COMMENT.HEADERS_NOT_CONTAIN_NEEDED_PROPERTY',
        translate: 'Missing authentication',
      },
      {
        message: 'DELETE_COMMENT.HEADERS_NOT_CONTAIN_NEEDED_PROPERTY',
        translate: 'Missing authentication',
      },
    ];

    const invariantErrorMessage = [
      {
        message: 'REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY',
        translate: 'tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada',
      },
      {
        message: 'REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION',
        translate: 'tidak dapat membuat user baru karena tipe data tidak sesuai',
      },
      {
        message: 'REGISTER_USER.USERNAME_LIMIT_CHAR',
        translate: 'tidak dapat membuat user baru karena karakter username melebihi batas limit',
      },
      {
        message: 'REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER',
        translate: 'tidak dapat membuat user baru karena username mengandung karakter terlarang',
      },
      {
        message: 'USER_LOGIN.NOT_CONTAIN_NEEDED_PROPERTY',
        translate: 'harus mengirimkan username dan password',
      },
      {
        message: 'USER_LOGIN.NOT_MEET_DATA_TYPE_SPECIFICATION',
        translate: 'username dan password harus string',
      },
      {
        message: 'REFRESH_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN',
        translate: 'harus mengirimkan token refresh',
      },
      {
        message: 'REFRESH_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION',
        translate: 'refresh token harus string',
      },
      {
        message: 'DELETE_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN',
        translate: 'harus mengirimkan token refresh',
      },
      {
        message: 'DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION',
        translate: 'refresh token harus string',
      },
      {
        message: 'POST_THREAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY',
        translate: 'tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada',
      },
      {
        message: 'POST_THREAD.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION',
        translate: 'tidak dapat membuat thread baru karena tipe data tidak sesuai',
      },
      {
        message: 'POST_THREAD.HEADERS_NOT_MEET_DATA_TYPE_SPECIFICATION',
        translate: 'tidak dapat membuat thread baru karena tipe data authorization token headers tidak sesuai',
      },
      {
        message: 'POST_COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY',
        translate: 'tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada',
      },
      {
        message: 'POST_COMMENT.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION',
        translate: 'tidak dapat membuat comment baru karena tipe data properti tidak sesuai',
      },
      {
        message: 'POST_COMMENT.HEADERS_NOT_MEET_DATA_TYPE_SPECIFICATION',
        translate: 'tidak dapat membuat comment baru karena tipe data authorization token headers tidak sesuai',
      },
      {
        message: 'DELETE_COMMENT.HEADERS_NOT_MEET_DATA_TYPE_SPECIFICATION',
        translate: 'tidak dapat menghapus komentar karena tipe data auth token tidak sesuai',
      },
    ];

    // Action
    const invmap = ermapRegister(new Map(), invariantErrorMessage);
    const autmap = ermapRegister(new Map(), authenticationErrorMessage);
    const spyTranslate = jest.spyOn(DomainErrorTranslator, DomainErrorTranslator.translate.name);

    // Assert
    let calledTimes = invariantErrorMessage.length;
    calledTimes += authenticationErrorMessage.length;

    invmap.forEach((httpError, domainError) => {
      expect(DomainErrorTranslator.translate(new Error(domainError)))
        .toStrictEqual(new InvariantError(httpError));
    });
    autmap.forEach((httpError, domainError) => {
      expect(DomainErrorTranslator.translate(new Error(domainError)))
        .toStrictEqual(new AuthenticationError(httpError));
    });
    expect(spyTranslate).toBeCalledTimes(calledTimes);
  });
});
