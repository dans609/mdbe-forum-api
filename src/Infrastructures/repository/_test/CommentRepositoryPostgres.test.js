const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const RequestTestHelper = require('../../../../tests/RequestTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const PostComment = require('../../../Domains/comments/entities/PostComment');
const PostedComment = require('../../../Domains/comments/entities/PostedComment');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('CommentRepositoryPostgres', () => {
  beforeAll(() => {
    const payload = { content: 'Content dari komentar' };
    const params = { threadId: 'thread-123', commentId: 'comment-123' };
    const headers = { authorization: 'Bearer token-123' };
    RequestTestHelper.setData({
      payload, params, headers, owner: 'user-123',
    });
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    RequestTestHelper.cleanData();
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist post comment in database', async () => {
      // Arrange
      const requestHelper = RequestTestHelper;
      const headerAuth = requestHelper.headers.authorization;
      const postComment = new PostComment({ ...requestHelper }, headerAuth);
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      await ThreadsTableTestHelper.addThreads({ id: requestHelper.params.threadId });

      function date() { this.toISOString = () => '12-30-2022'; }
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, date, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.addComment({ ...postComment, owner: requestHelper.owner });

      // Assert
      const comments = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comments).toHaveLength(1);
    });

    it('should return posted comment correctly', async () => {
      // Arrange
      const requestHelper = RequestTestHelper;
      const headerAuth = requestHelper.headers.authorization;
      const postComment = new PostComment({ ...requestHelper }, headerAuth);
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      await ThreadsTableTestHelper.addThreads({ id: requestHelper.params.threadId });

      function date() { this.toISOString = () => '12-30-2022'; }
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, date, fakeIdGenerator);

      // Action
      const postedComment = await commentRepositoryPostgres.addComment({
        ...postComment, owner: requestHelper.owner,
      });

      // Assert
      expect(postedComment).toStrictEqual(new PostedComment({
        id: 'comment-123',
        content: requestHelper.payload.content,
        owner: requestHelper.owner,
      }));
    });
  });

  describe('verifyCommentByThreadId function', () => {
    it('should throw NotFoundError when commentId is wrong', async () => {
      // Arrange
      const { params, owner } = RequestTestHelper;
      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThreads({ id: params.threadId, owner });
      await CommentsTableTestHelper.addComment({
        id: params.commentId,
        threadId: params.threadId,
        owner,
      });

      // Action
      const repositoryPostgres = new CommentRepositoryPostgres(pool, {}, {});
      const errorRequest = {
        commentId: 'comment-abc',
        threadId: params.threadId,
        owner,
      };

      // Assert
      await expect(repositoryPostgres.verifyCommentByThreadId({ ...errorRequest }))
        .rejects.toThrow(NotFoundError);
      await expect(repositoryPostgres.verifyCommentByThreadId({ ...errorRequest }))
        .rejects.toThrowError('komentar tidak ditemukan atau id yang dimasukkan salah');
    });

    it('shouldn\'t throw NotFoundError when the action is verified', async () => {
      // Arrange
      const { params, owner } = RequestTestHelper;
      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThreads({ id: params.threadId, owner });
      await CommentsTableTestHelper.addComment({
        id: params.commentId,
        threadId: params.threadId,
        owner,
      });

      // Action
      const repositoryPostgres = new CommentRepositoryPostgres(pool, {}, {});

      // Assert
      await expect(repositoryPostgres.verifyCommentByThreadId({ ...params, owner }))
        .resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should throw AuthorizationError when owner is not valid', async () => {
      // Arrange
      const { params, owner } = RequestTestHelper;
      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThreads({ id: params.threadId, owner });
      await CommentsTableTestHelper.addComment({
        id: params.commentId,
        threadId: params.threadId,
        owner,
      });

      // Action
      const repositoryPostgres = new CommentRepositoryPostgres(pool, {}, {});
      const errorRequestPayload = {
        ...params,
        owner: 'user-abc',
      };

      // Assert
      await expect(repositoryPostgres.verifyCommentOwner({ ...errorRequestPayload }))
        .rejects.toThrow(AuthorizationError);
      await expect(repositoryPostgres.verifyCommentOwner({ ...errorRequestPayload }))
        .rejects.toThrowError('komentar tidak ditemukan atau owner salah');
    });

    it('shouldn\'t throw AuthorizationError when owner of the comments is valid', async () => {
      // Arrange
      const { params, owner } = RequestTestHelper;
      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThreads({ id: params.threadId, owner });
      await CommentsTableTestHelper.addComment({
        id: params.commentId,
        threadId: params.threadId,
        owner,
      });

      // Action
      const repositoryPostgres = new CommentRepositoryPostgres(pool, {}, {});
      const correctRequestPayload = {
        commentId: params.commentId,
        owner,
      };

      // Assert
      await expect(repositoryPostgres.verifyCommentOwner(correctRequestPayload))
        .resolves.not.toThrow(AuthorizationError);
    });
  });

  describe('softDeleteById function', () => {
    it('should delete comment (set is_deleted to true) when id and owner is valid', async () => {
      // Arrange
      const { params, owner } = RequestTestHelper;
      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThreads({ id: params.threadId, owner });
      await CommentsTableTestHelper.addComment({
        id: params.commentId,
        threadId: params.threadId,
        owner,
      });

      // Action
      const repositoryPostgres = new CommentRepositoryPostgres(pool, {}, {});

      // Assert
      await expect(repositoryPostgres.softDeleteById(params.commentId))
        .resolves.not.toThrow(NotFoundError);
      expect((await CommentsTableTestHelper.findCommentById(params.commentId))[0]).toMatchObject({
        owner,
        id: params.commentId,
        thread_id: params.threadId,
        is_deleted: true,
      });
    });

    it('should throw NotFoundError when multiple action executed (already deleted)', async () => {
      // Arrange
      const { params, owner } = RequestTestHelper;
      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThreads({ id: params.threadId, owner });
      await CommentsTableTestHelper.addComment({
        id: params.commentId,
        threadId: params.threadId,
        owner,
      });

      // Action
      const repositoryPostgres = new CommentRepositoryPostgres(pool, {}, {});

      // Assert
      await expect(repositoryPostgres.softDeleteById(params.commentId))
        .resolves.not.toThrowError(NotFoundError);
      await expect(repositoryPostgres.softDeleteById(params.commentId))
        .rejects.toThrow(NotFoundError);
      await expect(repositoryPostgres.softDeleteById(params.commentId))
        .rejects.toThrowError('komentar tidak ada atau telah dihapus');
    });
  });

  describe('getCommentsByThreadId function', () => {
    it('should return an empty array when no comments is exists that belongs to the thread', async () => {
      // Arrange
      const user = { id: 'user-123', username: 'dicoding' };
      const thread = { id: 'thread-123', owner: user.id };

      /* add data to database and create repository instance */
      await UsersTableTestHelper.addUser({ ...user });
      await ThreadsTableTestHelper.addThreads({ ...thread });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {}, {});

      // Action
      const detailComment = await commentRepositoryPostgres.getCommentsByThreadId(thread.id);

      // Assert
      expect(detailComment).toBeDefined();
      expect(detailComment).toHaveLength(0);
    });

    it('should correctly return detail all comments (includes deleted comment) and order comments by date (asc)', async () => {
      // Arrange
      const responses = [
        {
          id: 'comment-xxx',
          content: 'Hello world',
          username: 'johndoe',
          date: '12-30-2022',
        },
        {
          id: 'comment-abc',
          content: 'Sebuah komentar',
          username: 'dicoding',
          date: '12-28-2022',
        },
        {
          id: 'comment-123',
          content: 'Content dari komentar',
          username: 'johndoe',
          date: '12-29-2022',
        },
      ];

      /* pre-requisites object to store data into database */
      const firstUser = { id: 'user-abc', username: 'johndoe' };
      const secondUser = { id: 'user-123', username: 'dicoding' };
      const threadData = { id: 'thread-123', owner: secondUser.id };
      const comment1FK = { threadId: threadData.id, owner: firstUser.id };
      const comment2FK = { threadId: threadData.id, owner: secondUser.id };
      const comment3FK = { threadId: threadData.id, owner: firstUser.id };

      /* add required data to database and create repository instance */
      await UsersTableTestHelper.addUser({ ...firstUser });
      await UsersTableTestHelper.addUser({ ...secondUser });
      await ThreadsTableTestHelper.addThreads({ ...threadData });
      await CommentsTableTestHelper.addComment({ ...comment1FK, ...responses[0] });
      await CommentsTableTestHelper.addComment({ ...comment2FK, ...responses[1] });
      await CommentsTableTestHelper.addComment({ ...comment3FK, ...responses[2] });
      const commentRepoPostgres = new CommentRepositoryPostgres(pool, {}, {});

      // Action
      /* random deleting comment and get all comments belong the thread */
      await commentRepoPostgres.softDeleteById(responses[2].id);
      const detailComment = await commentRepoPostgres.getCommentsByThreadId(threadData.id);

      // Assert
      let testSuccess = 0;
      const deletedContent = '**komentar telah dihapus**';

      expect(detailComment).toHaveLength(responses.length);
      testSuccess += 1;

      detailComment.forEach((comment) => {
        /* this test will result 1 point of each loop */
        /* the comment length is 3, therefore the testSuccess value must be added by 3 point */
        expect(comment).toBeInstanceOf(DetailComment);
        testSuccess += 1;

        responses.forEach((r) => {
          switch (comment.id) {
            case r.id:
              /* this test will result 1 point of each loop */
              /* comment length is 3 therefore +3 point is added to testSuccess */
              expect(comment).toMatchObject({
                id: r.id,
                date: r.date,
                username: r.username,
              });
              testSuccess += 1;

              /* the condition/code below will result 1 point of loop */
              /* comment length is 3 therefore +3 point is added to testSuccess */
              if (r.id === responses[2].id) {
                expect(comment.content).toEqual(deletedContent);
                testSuccess += 1;
                break;
              }

              expect(comment.content).toEqual(r.content);
              expect(comment.content).not.toEqual(deletedContent);
              testSuccess += 1;
              break;
            default:
              break;
          }
        });
      });
      expect(testSuccess).toEqual(10);
    });
  });
});
