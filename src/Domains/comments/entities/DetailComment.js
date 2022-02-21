class DetailComment {
  constructor(responses) {
    this._verifyResponse(responses);

    const {
      id, content, username, date,
    } = responses;
    this.id = id;
    this.username = username;
    this.date = date;
    this.content = content;
  }

  _verifyResponse(res) {
    if (!res.id || !res.content || !res.username || !res.date) {
      throw new Error('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    const keys = Object.keys(res);
    const allowedKeys = ['id', 'username', 'date', 'content'];
    keys.forEach((key) => {
      if (allowedKeys.indexOf(key) > -1) {
        if (typeof res[key] !== 'string') {
          throw new Error('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
        }
      }
    });
  }
}

module.exports = DetailComment;
