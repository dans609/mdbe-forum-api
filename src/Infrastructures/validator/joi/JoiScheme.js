class JoiScheme {
  constructor(Joi) {
    this._Joi = Joi;
  }

  credentialsScheme() {
    return this._Joi.object().keys({
      id: this._Joi.string().required(),
      username: this._Joi.string().required(),
    });
  }
}

module.exports = JoiScheme;
