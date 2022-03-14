class PutLike {
  constructor(params, userId) {
    this._verifyParams(params);
    this._verifyAuth(userId);

    const { threadId, commentId } = params;
    this.threadId = threadId;
    this.commentId = commentId;
    this.userId = userId;
  }

  _verifyParams(params) {
    if (!params.threadId || !params.commentId) {
      throw new Error('PUT_LIKE.PARAMS_NOT_CONTAIN_NEEDED_PROPERTY');
    }
  }

  _verifyAuth(userId) {
    if (!userId) {
      throw new Error('PUT_LIKE.HEADERS_NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof userId !== 'string') {
      throw new Error('PUT_LIKE.HEADERS_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = PutLike;
