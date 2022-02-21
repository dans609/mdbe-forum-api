class GetThread {
  constructor(params) {
    this._verifyParams(params);
    this.threadId = params.threadId;
  }

  _verifyParams({ threadId }) {
    if (!threadId) {
      throw new Error('GET_THREAD.PARAMS_NOT_CONTAIN_NEEDED_PROPERTY');
    }
  }
}

module.exports = GetThread;
