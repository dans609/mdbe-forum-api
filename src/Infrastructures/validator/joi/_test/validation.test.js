/* eslint-disable no-unused-vars */
const JoiScheme = require('../JoiScheme');
const JoiValidator = require('../JoiValidator');

describe('JoiValidator', () => {
  describe('a set function', () => {
    it('should set new value to \'data\' property', () => {
      // Arrange
      const credentials = { id: 'user-123', username: 'dicoding' };
      const joiValidator = new JoiValidator({});

      // Action
      joiValidator.set(credentials);

      // Assert
      expect(joiValidator._data).toEqual(credentials);
    });
  });

  describe('a validateCredentials function', () => {
    it('should return validation object correctly', () => {
      // Arrange
      const credentials = { id: 'user-123', username: 'dicoding' };
      function MockJoi() {
        this.object = () => this;
        this.keys = (_scheme) => this;
        this.string = () => this;
        this.required = () => this;

        this.value = undefined;
        this.validate = jest.fn().mockImplementation(() => {
          this.value = { id: 'user-123', username: 'dicoding' };
          return this;
        });
      }

      /* creating instances */
      const mockJoi = new MockJoi();
      const joiScheme = new JoiScheme(mockJoi);
      const joiValidator = new JoiValidator(joiScheme);

      // Action
      const validateCredentials = joiValidator.set(credentials).validateCredentials();

      // Assert
      expect(mockJoi.validate).toBeCalledWith(credentials);
      expect(validateCredentials).not.toBeUndefined();
      expect(validateCredentials).toStrictEqual(credentials);
    });

    it('should throw TypeError when data is not provided or setted', () => {
      // Arrange
      const joiScheme = new JoiScheme({});
      const joiValidator = new JoiValidator(joiScheme);

      // Action and Assert
      const errorMessage = "Data isn't setted, set first with 'set()' method; [DATA NOT VALID]";
      expect(() => joiValidator.validateCredentials()).toThrow(TypeError);
      expect(() => joiValidator.validateCredentials()).toThrowError(errorMessage);
    });

    it('should throw TypeError when type of data which provided by users is Falsy', () => {
      // Arrange
      const joiScheme = new JoiScheme({});
      const joiValidator = new JoiValidator(joiScheme);

      // Action
      const firstSet = joiValidator.set(null);
      const secondSet = joiValidator.set(undefined);

      // Assert
      const errorMessage = "Data isn't setted, set first with 'set()' method; [DATA NOT VALID]";
      expect(() => firstSet.validateCredentials()).toThrow(TypeError);
      expect(() => firstSet.validateCredentials()).toThrowError(errorMessage);
      expect(() => secondSet.validateCredentials()).toThrow(TypeError);
      expect(() => secondSet.validateCredentials()).toThrowError(errorMessage);
    });
  });
});
