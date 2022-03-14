class PostThread {
  constructor(payload, userId) {
    this._verifyPayload(payload);
    this._verifyId(userId);

    this.title = payload.title;
    this.body = payload.body;
    this.userId = userId;
  }

  _verifyPayload({ title, body }) {
    if (!title || !body) {
      throw new Error('POST_THREAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof title !== 'string' || typeof body !== 'string') {
      throw new Error('POST_THREAD.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  _verifyId(userId) {
    if (!userId) {
      throw new Error('POST_THREAD.HEADERS_NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof userId !== 'string') {
      throw new Error('POST_THREAD.HEADERS_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = PostThread;
