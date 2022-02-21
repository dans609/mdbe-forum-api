class PostedThread {
  constructor(responses) {
    this._verifyResponses(responses);

    const { id, title, owner } = responses;
    this.id = id;
    this.title = title;
    this.owner = owner;
  }

  _verifyResponses({ id, title, owner }) {
    if (!id || !title || !owner) throw new Error('POSTED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    if (typeof id !== 'string' || typeof title !== 'string' || typeof owner !== 'string') {
      throw new Error('POSTED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = PostedThread;
