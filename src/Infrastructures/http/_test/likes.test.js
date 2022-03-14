const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments/{commentId}/likes endpoint', () => {
  const responseData = {
    addedThread: {},
    addedComment: {},
    users: { first: {}, second: {}, third: {} },
  };

  beforeAll(async () => {
    const server = await createServer(container);
    const serverHelper = await ServerTestHelper.init(server).injectUser('dicoding')
      .then((helper) => helper.injectThread({ title: 'Thread Title', body: 'Thread body' }))
      .then((helper) => helper.injectComment('hello world'));

    responseData.addedThread = serverHelper.addedThread;
    responseData.addedComment = serverHelper.addedComment;
    responseData.users.first.id = serverHelper.userId;
    responseData.users.first.token = serverHelper.accessToken;

    // add another user
    await serverHelper.injectUser('johndoe');
    responseData.users.second.id = serverHelper.userId;
    responseData.users.second.token = serverHelper.accessToken;

    // add more user
    await serverHelper.injectUser('dans');
    responseData.users.third.id = serverHelper.userId;
    responseData.users.third.token = serverHelper.accessToken;
  });

  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('when PUT threads/{threadId}/comments/{commentId}/likes', () => {
    it('should response 200 when user LIKE comment', async () => {
      const { addedThread, addedComment, users } = responseData;
      const threadId = addedThread.id;
      const commentId = addedComment.id;
      const server = await createServer(container);

      // Action
      /* comment is liked by 'dicoding' a.k.a owner of the thread and comment */
      const firstResponse = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: {
          Authorization: `Bearer ${users.first.token}`,
        },
      });

      /* comment is liked by 'johndoe' */
      const secondResponse = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: {
          Authorization: `Bearer ${users.second.token}`,
        },
      });

      /* comment is liked by 'dans */
      const thirdResponse = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: {
          Authorization: `Bearer ${users.third.token}`,
        },
      });

      // Assert
      const parameter = { threadId: addedThread.id, commentId: addedComment.id };
      const likes = await LikesTableTestHelper.getListLikesInComment(parameter);
      const firstJson = JSON.parse(firstResponse.payload);
      const secondJson = JSON.parse(secondResponse.payload);
      const thirdJson = JSON.parse(thirdResponse.payload);

      expect(firstResponse.statusCode).toEqual(200);
      expect(secondResponse.statusCode).toEqual(200);
      expect(thirdResponse.statusCode).toEqual(200);
      expect(firstJson.status).toEqual('success');
      expect(secondJson.status).toEqual('success');
      expect(thirdJson.status).toEqual('success');
      expect(likes).toHaveLength(3);
    });

    it('should response 200 when user UNLIKE comment', async () => {
      const { addedThread, addedComment, users } = responseData;
      const server = await createServer(container);

      // Action
      /* comment is liked by 'dans' */
      await server.inject({
        method: 'PUT',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/likes`,
        headers: {
          Authorization: `Bearer ${users.third.token}`,
        },
      });

      /* for a minutes later, 'dans' unlike the comment */
      const likeResponse = await server.inject({
        method: 'PUT',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/likes`,
        headers: {
          Authorization: `Bearer ${users.third.token}`,
        },
      });

      // Assert
      const parameter = { threadId: addedThread.id, commentId: addedComment.id };
      const likes = await LikesTableTestHelper.getListLikesInComment(parameter);
      const responseJson = JSON.parse(likeResponse.payload);
      expect(likeResponse.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(likes).toHaveLength(0);
    });

    it('should response 404 when threadId is not exist', async () => {
      const { addedComment, users } = responseData;
      const threadId = 'thread-123';
      const server = await createServer(container);

      // Action
      const likeResponse = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${addedComment.id}/likes`,
        headers: {
          Authorization: `Bearer ${users.first.token}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(likeResponse.payload);
      expect(likeResponse.statusCode).toEqual(404);
      expect(responseJson).toMatchObject({
        status: 'fail',
        message: 'thread tidak ditemukan atau id yang dimasukkan salah',
      });
    });

    it('should response 404 when commentId is not exist', async () => {
      const { addedThread, users } = responseData;
      const commentId = 'comment-123';
      const server = await createServer(container);

      // Action
      const likeResponse = await server.inject({
        method: 'PUT',
        url: `/threads/${addedThread.id}/comments/${commentId}/likes`,
        headers: {
          Authorization: `Bearer ${users.third.token}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(likeResponse.payload);
      expect(likeResponse.statusCode).toEqual(404);
      expect(responseJson).toMatchObject({
        status: 'fail',
        message: 'komentar tidak ditemukan atau id yang dimasukkan salah',
      });
    });

    it('should response 401 when request did not contain authorization token headers', async () => {
      // Arrange
      const { addedThread, addedComment } = responseData;
      const server = await createServer(container);

      // Action
      const likeResponse = await server.inject({
        method: 'PUT',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/likes`,
      });

      // Assert
      const responseJson = JSON.parse(likeResponse.payload);
      expect(likeResponse.statusCode).toEqual(401);
      expect(responseJson).toBeInstanceOf(Object);
      expect(responseJson.message).toStrictEqual('Missing authentication');
    });
  });
});
