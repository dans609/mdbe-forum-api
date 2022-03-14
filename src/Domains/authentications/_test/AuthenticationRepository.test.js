const AuthenticationRepository = require('../AuthenticationRepository');

describe('AuthenticationRepository interface', () => {
  it('should throw error when invoke unimplemented method', async () => {
    // Arrange
    const authenticationRepository = new AuthenticationRepository();
    const message = 'AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED';

    // Action & Assert
    await expect(authenticationRepository.addToken('')).rejects.toThrowError(message);
    await expect(authenticationRepository.checkAvailabilityToken('')).rejects.toThrowError(message);
    await expect(authenticationRepository.deleteToken('')).rejects.toThrowError(message);
  });
});
