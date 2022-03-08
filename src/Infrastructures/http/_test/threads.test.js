const ServerTestHelper = require('../../../../tests/ServerTestHelper');
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
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      // Arrange
      const requestPayload = { title: 'Thread Title', body: 'Thread body' };
      const server = await createServer(container);
      const serverHelper = await ServerTestHelper.startService(server);

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
      const serverHelper = await ServerTestHelper.startService(server);

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
      const serverHelper = await ServerTestHelper.startService(server);

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
      const server = await createServer(container);
      const firstUser = await ServerTestHelper.startService(server);
      await firstUser.injectThread({ threadTitle: 'Thread Title' });
      await firstUser.injectComment({ content: 'Sebuah komentar' });
      await firstUser.injectComment({ content: 'Content dari komentar' });
      await firstUser.deleteLastComment();

      /* add more user and comment that belong to the firstUser thread */
      const serverHelper = firstUser.changeUsername('johndoe');
      const secondUser = await serverHelper.startService(server);
      await secondUser.injectComment({ content: 'Hello world' });

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${serverHelper.addedThread.id}`,
      });

      /* get all required data which have been posted to database */
      const thread = (await ThreadsTableTestHelper.findThreadById(serverHelper.addedThread.id))[0];
      const user = (await UsersTableTestHelper.findUsersById(thread.owner))[0];
      const comments = (await getAllCommentsInThread(thread.id)).map((c) => ({
        id: c.id,
        username: c.username,
        date: c.date.toISOString(),
        content: (c.is_deleted) ? '**komentar telah dihapus**' : c.content,
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
      const serverHelper = await ServerTestHelper.startService(server);
      await serverHelper.injectThread({ threadTitle: 'Thread Title' });

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
      await ServerTestHelper.startService(server);

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
