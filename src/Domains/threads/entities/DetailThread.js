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
    const propertyError = 'DETAIL_THREAD.RESPONSES_NOT_CONTAIN_NEEDED_PROPERTY';
    const typeError = 'DETAIL_THREAD.RESPONSES_NOT_MEET_DATA_TYPE_SPECIFICATION';

    const isPropertyError = !res.id
      || !res.title
      || !res.body
      || !res.date
      || !res.username;

    const isTypeError = typeof res.id !== 'string'
      || typeof res.title !== 'string'
      || typeof res.body !== 'string'
      || typeof res.date !== 'string'
      || typeof res.username !== 'string';

    if (isPropertyError) throw new Error(propertyError);
    if (isTypeError) throw new Error(typeError);
  }
}

module.exports = DetailThread;
