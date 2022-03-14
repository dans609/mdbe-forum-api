const UserRepository = require('../UserRepository');

describe('UserRepository interface', () => {
  it('should throw error when invoke abstract behavior', async () => {
    // Arrange
    const userRepository = new UserRepository();
    const message = 'USER_REPOSITORY.METHOD_NOT_IMPLEMENTED';

    // Action and Assert
    await expect(userRepository.addUser({})).rejects.toThrowError(message);
    await expect(userRepository.verifyAvailableUsername('')).rejects.toThrowError(message);
    await expect(userRepository.getPasswordByUsername('')).rejects.toThrowError(message);
    await expect(userRepository.getIdByUsername('')).rejects.toThrowError(message);
  });
});
