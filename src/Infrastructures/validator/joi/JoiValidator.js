class JoiValidator {
  constructor(joiScheme) {
    this._joiScheme = joiScheme;
    this._data = null;
  }

  set(data) {
    this._data = data;
    return this;
  }

  validateCredentials() {
    this._verifyData(this._data);
    const { _data, _joiScheme } = this;
    const isValidated = _joiScheme.credentialsScheme().validate(_data);

    return isValidated.value;
  }

  _verifyData(data) {
    if (!data) {
      throw new TypeError("Data isn't setted, set first with 'set()' method; [DATA NOT VALID]");
    }
  }
}

module.exports = JoiValidator;
