class GetLike {
  constructor(responses) {
    this._verifyResponse(responses);
    this.likeCount = responses.length;
  }

  _verifyResponse(responses) {
    const isFalsy = !responses;
    const isArray = !(responses instanceof Array);

    if (isFalsy) throw new Error('GET_LIKE.RESPONSES_IS_FALSY');
    if (isArray) throw new Error('GET_LIKE.RESPONSES_NOT_MEET_DATA_TYPE_SPECIFICATION');

    responses.forEach((res) => {
      const isObject = !(this._isObject(res));
      const isPropertyFalsy = !res.id || !res.comment_id;
      const isNotString = typeof res.id !== 'string'
        || typeof res.comment_id !== 'string';

      if (isObject) throw new Error('GET_LIKE.RESPONSES_ELEMENT_IS_NOT_OBJECT');
      if (isPropertyFalsy) throw new Error('GET_LIKE.RESPONSES_ELEMENT_NOT_CONTAIN_NEEDED_PROPERTY');
      if (isNotString) throw new Error('GET_LIKE.PROPERTY_OF_RESPONSES_ELEMENT_NOT_MEET_DATA_TYPE_SPECIFICATION');
    });
  }

  _isObject(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
  }
}

module.exports = GetLike;
