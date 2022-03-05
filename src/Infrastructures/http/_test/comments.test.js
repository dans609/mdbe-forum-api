const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const RequestTestHelper = require('../../../../tests/RequestTestHelper');
const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');

describe('/threads/{threadId}/comments endpoint', () => {
  beforeAll(() => {
    const params = {
      errorThreadId: 'thread-xxx',
      threadId: 'thread-123',
      errorCommentId: 'comment-xxx',
      commentId: 'coment-123',
    };
    const payload = { errorContent: true, content: 'Content dari komentar' };
    RequestTestHelper.setData({ payload, params });
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    RequestTestHelper.cleanData();
    await pool.end();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and persisted comment', async () => {
      // Arrange
      const { payload } = RequestTestHelper;
      const server = await createServer(container);
      const serverHelper = await ServerTestHelper.startService(server);
      await serverHelper.injectThread({ threadTitle: 'Thread Title' });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${serverHelper.addedThread.id}/comments`,
        payload: { content: payload.content },
        headers: {
          Authorization: `Bearer ${serverHelper.accessToken}`,
        },
      });
      const comments = await CommentsTableTestHelper.getCommentIdByFks({
        threadId: serverHelper.addedThread.id,
        owner: serverHelper.userId,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
      expect(responseJson.data.addedComment).toMatchObject({
        id: comments[0].id,
        content: payload.content,
        owner: serverHelper.userId,
      });
    });

    it('should response 404 when params threadId is wrong or not exist', async () => {
      // Arrange
      const { payload: requestPayload, params } = RequestTestHelper;
      const server = await createServer(container);
      const serverHelper = await ServerTestHelper.startService(server);
      await ThreadsTableTestHelper.addThreads({ owner: serverHelper.userId });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${params.errorThreadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${serverHelper.accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson).toMatchObject({
        status: 'fail',
        message: 'thread tidak ditemukan atau id yang dimasukkan salah',
      });
    });

    it('should response 400 when request payload did not contain needed property', async () => {
      // Arrange
      const { threadId } = RequestTestHelper.params;
      const server = await createServer(container);
      const serverHelper = await ServerTestHelper.startService(server);
      await ThreadsTableTestHelper.addThreads({ owner: serverHelper.userId });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {},
        headers: {
          Authorization: `Bearer ${serverHelper.accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson).toMatchObject({
        status: 'fail',
        message: 'tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada',
      });
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const { payload, params } = RequestTestHelper;
      const server = await createServer(container);
      const serverHelper = await ServerTestHelper.startService(server);
      await ThreadsTableTestHelper.addThreads({ owner: serverHelper.userId });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${params.threadId}/comments`,
        payload: { content: payload.errorContent },
        headers: {
          Authorization: `Bearer ${serverHelper.accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson).toMatchObject({
        status: 'fail',
        message: 'tidak dapat membuat comment baru karena tipe data properti tidak sesuai',
      });
    });

    it('should response 401 when request did not contain authorization token headers', async () => {
      // Arrange
      const { payload, params } = RequestTestHelper;
      const server = await createServer(container);
      const serverHelper = await ServerTestHelper.startService(server);
      await ThreadsTableTestHelper.addThreads({ owner: serverHelper.userId });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${params.threadId}/comments`,
        payload: { content: payload.content },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson).toBeInstanceOf(Object);
      expect(responseJson.message).toStrictEqual('Missing authentication');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 200 when delete comment request is correct ', async () => {
      // Arrange
      const { payload } = RequestTestHelper;
      const server = await createServer(container);
      const serverHelper = await ServerTestHelper.startService(server);
      await serverHelper.injectThread({ threadTitle: 'Thread Title' });
      await serverHelper.injectComment({ content: payload.content });

      // Action
      const { accessToken, addedThread, addedComment } = ServerTestHelper;
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 404 when delete request is execute multiple times', async () => {
      // Arrange
      const { payload } = RequestTestHelper;
      const server = await createServer(container);
      const serverHelper = await ServerTestHelper.startService(server);
      await serverHelper.injectThread({ threadTitle: 'Thread Title' });
      await serverHelper.injectComment({ content: payload.content });

      // Action
      const { accessToken, addedThread, addedComment } = ServerTestHelper;
      await server.inject({
        method: 'DELETE',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson).toMatchObject({
        status: 'fail',
        message: 'komentar tidak ada atau telah dihapus',
      });
    });

    it('should response 404 when params threadId is wrong', async () => {
      // Arrange
      const { errorThreadId, threadId, commentId } = RequestTestHelper.params;
      const server = await createServer(container);
      const serverHelper = await ServerTestHelper.startService(server);
      await ThreadsTableTestHelper.addThreads({ id: threadId, owner: serverHelper.userId });
      await CommentsTableTestHelper.addComment({
        threadId,
        id: commentId,
        owner: serverHelper.userId,
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${errorThreadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${serverHelper.accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson).toMatchObject({
        status: 'fail',
        message: 'thread tidak ditemukan atau id yang dimasukkan salah',
      });
    });

    it('should response 404 when params commentId is wrong', async () => {
      // Arrange
      const { errorCommentId, threadId, commentId } = RequestTestHelper.params;
      const server = await createServer(container);
      const serverHelper = await ServerTestHelper.startService(server);
      await ThreadsTableTestHelper.addThreads({ id: threadId, owner: serverHelper.userId });
      await CommentsTableTestHelper.addComment({
        threadId,
        id: commentId,
        owner: serverHelper.userId,
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${errorCommentId}`,
        headers: {
          Authorization: `Bearer ${serverHelper.accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson).toMatchObject({
        status: 'fail',
        message: 'komentar tidak ditemukan atau id yang dimasukkan salah',
      });
    });

    it('should response 403 when owner of the comment is wrong', async () => {
      // Arrange
      const {
        threadId,
        commentId,
        errorThreadId: secondThreadId,
        errorCommentId: secondCommentId,
      } = RequestTestHelper.params;
      const server = await createServer(container);
      const firstUser = await ServerTestHelper.startService(server);
      await ThreadsTableTestHelper.addThreads({ id: threadId, owner: firstUser.userId });
      await CommentsTableTestHelper.addComment({
        threadId,
        id: commentId,
        owner: firstUser.userId,
      });

      // Action
      /* pre-requisites */
      const serverHelper = ServerTestHelper.changeUsername('dans');
      const secondUser = await serverHelper.startService(server);
      await ThreadsTableTestHelper.addThreads({ id: secondThreadId, owner: secondUser.userId });
      await CommentsTableTestHelper.addComment({
        id: secondCommentId,
        threadId: secondThreadId,
        owner: secondUser.userId,
      });

      /* inject request */
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${secondUser.accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson).toMatchObject({
        status: 'fail',
        message: 'komentar tidak ditemukan atau owner salah',
      });
    });

    it('should response 401 when request not contain authorization token headers', async () => {
      const { threadId, commentId } = RequestTestHelper.params;
      const server = await createServer(container);
      const serverHelper = await ServerTestHelper.startService(server);
      await ThreadsTableTestHelper.addThreads({ id: threadId, owner: serverHelper.userId });
      await CommentsTableTestHelper.addComment({
        threadId,
        id: commentId,
        owner: serverHelper.userId,
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson).toBeInstanceOf(Object);
      expect(responseJson.message).toStrictEqual('Missing authentication');
    });
  });
});
