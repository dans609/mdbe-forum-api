const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');
const { getAllCommentsInThread } = require('../../../../tests/CommentsTableTestHelper');

describe('/threads endpoint', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await LikesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      // Arrange
      const requestPayload = { title: 'Thread Title', body: 'Thread body' };
      const server = await createServer(container);
      const serverHelper = await ServerTestHelper.init(server).injectUser('dicoding');

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${serverHelper.accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
      expect(responseJson.data.addedThread.id).toBeDefined();
      expect(responseJson.data.addedThread).toMatchObject({
        title: requestPayload.title,
        owner: serverHelper.userId,
      });
    });

    it('should response 400 when request payload did not contain needed property', async () => {
      // Arrange
      const requestPayload = { title: 'Thread Title' };
      const server = await createServer(container);
      const serverHelper = await ServerTestHelper.init(server).injectUser('dicoding');

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${serverHelper.accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson).toMatchObject({
        status: 'fail',
        message: 'tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada',
      });
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = { title: 123, body: true };
      const server = await createServer(container);
      const serverHelper = await ServerTestHelper.init(server).injectUser('johndoe');

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${serverHelper.accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson).toMatchObject({
        status: 'fail',
        message: 'tidak dapat membuat thread baru karena tipe data tidak sesuai',
      });
    });

    it('should response 400 when request did not contain authorization token headers', async () => {
      // Arrange
      const requestPayload = { title: 'Thread Title', body: 'Thread body' };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson).toBeInstanceOf(Object);
      expect(responseJson.message).toStrictEqual('Missing authentication');
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 and persisted detail thread', async () => {
      // Arrange
      const threadPayload = { title: 'Thread Title', body: 'Thread body' };

      /* create server and initialize helper */
      const server = await createServer(container);
      const serverHelper = ServerTestHelper.init(server);

      /* adding new user and let this user to be the thread owner */
      const firstUser = await serverHelper.injectUser('dicoding', true)
        .then((instance) => instance.injectThread(threadPayload))
        .then((instance) => instance.injectComment('Sebuah komentar', true))
        .then((instance) => instance.likeLastComment()) // user like his comment [c1=1]
        .then((instance) => instance.injectComment('Content dari komentar', true))
        .then((instance) => instance.likeLastComment()) // user like his comment [c2=1]
        .then((instance) => instance.deleteLastComment());

      /**
       * Add another user and make this user to post comments in @firstUser thread
       * then unlike comment of this user
       */
      await serverHelper.injectUser('johndoe', true)
        .then((instance) => instance.injectComment('Hello world', true))
        .then((instance) => instance.likeLastComment()) // this user like his own comment [c3=1]
        .then((instance) => instance.likeLastComment()); // this user unlike his comment [c3=0]

      /**
       * Add more users, the task of this users is just to like the comments
       * which has been posted before in the @firstUser thread
       */
      await serverHelper.injectUser('dans', true);
      await serverHelper.injectUser('jake', true);

      /* get required data from helper to inject another request which needs these data */
      const listTokens = serverHelper.getListTokens();
      const listCommentId = serverHelper.getSavedId('comment');
      const threadId = serverHelper.addedThread.id;

      /** @secondUser to @fourthUser liked the first comment which posted by @firstUser */
      const firstComment = listCommentId[0];
      const lastComment = listCommentId[2];
      await serverHelper.injectLike({ commentId: firstComment, threadId, token: listTokens[1] });
      await serverHelper.injectLike({ commentId: firstComment, threadId, token: listTokens[2] });
      await serverHelper.injectLike({ commentId: firstComment, threadId, token: listTokens[3] });

      /** @firstUser and @thirdUser liked third comment (last comment), posted by @secondUser */
      await serverHelper.injectLike({ commentId: lastComment, threadId, token: listTokens[0] });
      await serverHelper.injectLike({ commentId: lastComment, threadId, token: listTokens[2] });

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${serverHelper.addedThread.id}`,
      });

      /* get all required data which have been posted to database */
      const thread = (await ThreadsTableTestHelper.findThreadById(serverHelper.addedThread.id))[0];
      const user = (await UsersTableTestHelper.findUsersById(thread.owner))[0];
      const likes = await LikesTableTestHelper.getAllLikesInThread(thread.id);
      const comments = (await getAllCommentsInThread(thread.id)).map((c) => ({
        id: c.id,
        username: c.username,
        date: c.date.toISOString(),
        content: (c.is_deleted) ? '**komentar telah dihapus**' : c.content,
        likeCount: likes.filter((like) => like.comment_id === c.id).length,
      }));

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread).toStrictEqual({
        id: firstUser.addedThread.id,
        title: firstUser.addedThread.title,
        body: thread.body,
        date: thread.date.toISOString(),
        username: user.username,
        comments,
      });
    });

    it('should response 200 but with an empty array of comments', async () => {
      const server = await createServer(container);
      const serverHelper = await ServerTestHelper.init(server).injectUser('dicoding')
        .then((helper) => helper.injectThread({ title: 'Thread Title', body: 'Thread body' }));

      // Arrange
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${serverHelper.addedThread.id}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread.id).toBeDefined();
      expect(responseJson.data.thread.title).toBeDefined();
      expect(responseJson.data.thread.body).toBeDefined();
      expect(responseJson.data.thread.date).toBeDefined();
      expect(responseJson.data.thread.username).toBeDefined();
      expect(responseJson.data.thread.comments).toHaveLength(0);
    });

    it('should response 404 when threadId is not exist', async () => {
      const params = { threadId: 'thread-123' };
      const server = await createServer(container);
      await ServerTestHelper.init(server).injectUser('dicoding');

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${params.threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson).toMatchObject({
        status: 'fail',
        message: 'thread tidak ditemukan atau id yang dimasukkan salah',
      });
    });
  });
});
