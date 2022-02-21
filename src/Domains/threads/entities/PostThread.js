class PostThread {
  constructor(payload, authorization) {
    this._verifyPayload(payload);
    this._verifyAuth(authorization);

    this.title = payload.title;
    this.body = payload.body;
    this.authToken = authorization;
  }

  _verifyPayload({ title, body }) {
    if (!title || !body) {
      throw new Error('POST_THREAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof title !== 'string' || typeof body !== 'string') {
      throw new Error('POST_THREAD.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  _verifyAuth(authorization) {
    if (!authorization) {
      throw new Error('POST_THREAD.HEADERS_NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof authorization !== 'string') {
      throw new Error('POST_THREAD.HEADERS_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = PostThread;
