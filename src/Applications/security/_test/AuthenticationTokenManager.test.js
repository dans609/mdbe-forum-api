const AuthenticationTokenManager = require('../AuthenticationTokenManager');

describe('AuthenticationTokenManager interface', () => {
  it('should throw error when invoke unimplemented method', async () => {
    // Arrange
    const tokenManager = new AuthenticationTokenManager();
    const expectedError = 'AUTHENTICATION_TOKEN_MANAGER.METHOD_NOT_IMPLEMENTED';

    // Action & Assert
    await expect(tokenManager.createAccessToken('')).rejects.toThrowError(expectedError);
    await expect(tokenManager.createRefreshToken('')).rejects.toThrowError(expectedError);
    await expect(tokenManager.verifyRefreshToken('')).rejects.toThrowError(expectedError);
    await expect(tokenManager.getTokenByHeaders('')).rejects.toThrowError(expectedError);
    await expect(tokenManager.decodePayload('')).rejects.toThrowError(expectedError);
  });
});
