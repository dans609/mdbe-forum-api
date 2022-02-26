class PostComment {
  constructor(request, userId) {
    this._verifyPayload(request.payload);
    this._verifyParams(request.params);
    this._verifyId(userId);

    const { payload, params } = request;
    this.content = payload.content;
    this.threadId = params.threadId;
    this.userId = userId;
  }

  _verifyPayload(payload = {}) {
    if (!payload.content) {
      throw new Error('POST_COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof payload.content !== 'string') {
      throw new Error('POST_COMMENT.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  _verifyParams(params = {}) {
    if (!params.threadId) {
      throw new Error('POST_COMMENT.PARAMS_NOT_CONTAIN_NEEDED_PROPERTY');
    }
  }

  _verifyId(userId) {
    if (!userId) {
      throw new Error('POST_COMMENT.HEADERS_NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof userId !== 'string') {
      throw new Error('POST_COMMENT.HEADERS_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = PostComment;
