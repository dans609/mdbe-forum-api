/* istanbul ignore file */
const ServerTestHelper = {
  userId: undefined,
  accessToken: undefined,
  addedThread: undefined,
  addedComment: undefined,
  _server: undefined,
  _savedTokens: [],
  _savedId: [],

  init(server) {
    this._server = server;
    return this;
  },

  getListTokens() {
    return this._savedTokens;
  },

  getSavedId(criteria = 'all') {
    if (criteria === 'all') return this._savedId;
    const savedId = this._savedId.filter((id) => id.match(criteria));
    return savedId;
  },

  async injectUser(username, saveToken = false) {
    const responseUser = await this._server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username,
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      },
    });

    const responseAuth = await this._server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username,
        password: 'secret',
      },
    });

    const { data: userData } = JSON.parse(responseUser.payload);
    const { data: authData } = JSON.parse(responseAuth.payload);
    this.userId = userData.addedUser.id;
    this.accessToken = authData.accessToken;
    if (saveToken) this._savedTokens.push(this.accessToken);

    return this;
  },

  async injectThread({ title, body, saveId = false }) {
    const response = await this._server.inject({
      method: 'POST',
      url: '/threads',
      payload: { title, body },
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });

    const { data } = JSON.parse(response.payload);
    this.addedThread = data.addedThread;
    if (saveId) this._savedId.push(this.addedThread.id);

    return this;
  },

  async injectComment(content, saveId = false) {
    const response = await this._server.inject({
      method: 'POST',
      url: `/threads/${this.addedThread.id}/comments`,
      payload: { content },
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });

    const { data } = JSON.parse(response.payload);
    this.addedComment = data.addedComment;
    if (saveId) this._savedId.push(this.addedComment.id);

    return this;
  },

  async deleteLastComment() {
    await this._server.inject({
      method: 'DELETE',
      url: `/threads/${this.addedThread.id}/comments/${this.addedComment.id}`,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    return this;
  },

  async likeLastComment() {
    await this._server.inject({
      method: 'PUT',
      url: `/threads/${this.addedThread.id}/comments/${this.addedComment.id}/likes`,
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });

    return this;
  },

  async injectLike(req) {
    await this._server.inject({
      method: 'PUT',
      url: `/threads/${req.threadId}/comments/${req.commentId}/likes`,
      headers: { Authorization: `Bearer ${req.token}` },
    });

    return this;
  },
};

module.exports = ServerTestHelper;
