class DeleteComment {
  constructor(params, authorization) {
    this._verifyParams(params);
    this._verifyAuth(authorization);

    const { threadId, commentId } = params;
    this.threadId = threadId;
    this.commentId = commentId;
    this.authToken = authorization;
  }

  _verifyParams(params) {
    if (!params.threadId || !params.commentId) {
      throw new Error('DELETE_COMMENT.PARAMS_NOT_CONTAIN_NEEDED_PROPERTY');
    }
  }

  _verifyAuth(authorization) {
    if (!authorization) {
      throw new Error('DELETE_COMMENT.HEADERS_NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof authorization !== 'string') {
      throw new Error('DELETE_COMMENT.HEADERS_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DeleteComment;
