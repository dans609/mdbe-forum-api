class DetailThread {
  constructor(responses) {
    this._verifyResponse(responses);

    const {
      id, title, body, date, username,
    } = responses;
    this.id = id;
    this.title = title;
    this.body = body;
    this.date = date;
    this.username = username;
  }

  _verifyResponse(res) {
    if (!res.id || !res.title || !res.body || !res.date || !res.username) {
      throw new Error('DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    const keys = Object.keys(res);
    const allowedKeys = ['id', 'title', 'body', 'date', 'username'];
    keys.forEach((key) => {
      if (allowedKeys.indexOf(key) > -1) {
        if (typeof res[key] !== 'string') {
          throw new Error('DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
        }
      }
    });
  }
}

module.exports = DetailThread;
