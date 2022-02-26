class DeleteComment {
  constructor(params, userId) {
    this._verifyParams(params);
    this._verifyId(userId);

    const { threadId, commentId } = params;
    this.threadId = threadId;
    this.commentId = commentId;
    this.userId = userId;
  }

  _verifyParams(params) {
    if (!params.threadId || !params.commentId) {
      throw new Error('DELETE_COMMENT.PARAMS_NOT_CONTAIN_NEEDED_PROPERTY');
    }
  }

  _verifyId(userId) {
    if (!userId) {
      throw new Error('DELETE_COMMENT.HEADERS_NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof userId !== 'string') {
      throw new Error('DELETE_COMMENT.HEADERS_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DeleteComment;
