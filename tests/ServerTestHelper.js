/* istanbul ignore file */
const ServerTestHelper = {
  accessToken: 0,
  userId: 0,
  addedThread: 0,
  addedComment: 0,
  _server: 0,
  _username: 'dicoding',

  changeUsername(username) {
    this._username = username;
    return this;
  },

  async startService(server) {
    this._server = server;
    const userPayload = {
      username: this._username,
      password: 'secret',
      fullname: 'Dicoding Indonesia',
    };

    const responseUser = await this._server.inject({
      method: 'POST',
      url: '/users',
      payload: { ...userPayload },
    });

    const responseAuth = await this._server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username: userPayload.username,
        password: userPayload.password,
      },
    });

    const { data: userData } = JSON.parse(responseUser.payload);
    const { data: authData } = JSON.parse(responseAuth.payload);

    this.userId = userData.addedUser.id;
    this.accessToken = authData.accessToken;
    return this;
  },

  async injectThread({ threadTitle = 'Thread Title', threadBody = 'Thread body' }) {
    const responseThread = await this._server.inject({
      method: 'POST',
      url: '/threads',
      payload: { title: threadTitle, body: threadBody },
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    const { data: threadData } = JSON.parse(responseThread.payload);

    this.addedThread = threadData.addedThread;
    return this;
  },

  async injectComment(payload) {
    const responseComment = await this._server.inject({
      method: 'POST',
      url: `/threads/${this.addedThread.id}/comments`,
      payload,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    const { data: commentData } = JSON.parse(responseComment.payload);

    this.addedComment = commentData.addedComment;
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
};

module.exports = ServerTestHelper;
