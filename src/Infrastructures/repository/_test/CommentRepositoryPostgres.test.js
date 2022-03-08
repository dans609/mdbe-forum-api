const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const RequestTestHelper = require('../../../../tests/RequestTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const PostComment = require('../../../Domains/comments/entities/PostComment');
const PostedComment = require('../../../Domains/comments/entities/PostedComment');
const DeleteComment = require('../../../Domains/comments/entities/DeleteComment');
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
      const { payload, params, owner } = RequestTestHelper;
      const postComment = new PostComment({ payload, params }, owner);
      await UsersTableTestHelper.addUser({ username: 'dicoding', id: owner });
      await ThreadsTableTestHelper.addThreads({ id: params.threadId, owner });

      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.addComment({ ...postComment });

      // Assert
      const comments = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comments).toHaveLength(1);
    });

    it('should return posted comment correctly', async () => {
      // Arrange
      const { payload, params, owner } = RequestTestHelper;
      const postComment = new PostComment({ payload, params }, owner);
      await UsersTableTestHelper.addUser({ username: 'dicoding', id: owner });
      await ThreadsTableTestHelper.addThreads({ id: params.threadId, owner });

      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const postedComment = await commentRepositoryPostgres.addComment({ ...postComment });

      // Assert
      expect(postedComment).toStrictEqual(new PostedComment({
        id: 'comment-123',
        content: payload.content,
        owner,
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
      const repositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const errorRequest = {
        commentId: 'comment-abc',
        threadId: params.threadId,
        owner,
      };

      // Assert
      const notFoundError = 'komentar tidak ditemukan atau id yang dimasukkan salah';
      await expect(repositoryPostgres.verifyCommentByThreadId({ ...errorRequest }))
        .rejects.toThrow(new NotFoundError(notFoundError));
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
      const repositoryPostgres = new CommentRepositoryPostgres(pool, {});

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
      const errorRequestPayload = { ...params, owner: 'user-abc' };
      const repositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Assert
      const authorizationError = 'komentar tidak ditemukan atau owner salah';
      await expect(repositoryPostgres.verifyCommentOwner({ ...errorRequestPayload }))
        .rejects.toThrow(new AuthorizationError(authorizationError));
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
      const deleteCommentEntity = new DeleteComment(params, owner);
      const repositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Assert
      await expect(repositoryPostgres.verifyCommentOwner({ ...deleteCommentEntity }))
        .resolves.not.toThrow(AuthorizationError);
    });
  });

  describe('verifyCommentNotDeleted function', () => {
    it('shouldn\'t throw NotFoundError because the comment is verified that hasn\'t been deleted from database', async () => {
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
      const repositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Assert
      await expect(repositoryPostgres.verifyCommentNotDeleted(params.commentId))
        .resolves.not.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when comment has been deleted', async () => {
      // Arrange
      const { params, owner } = RequestTestHelper;
      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThreads({ id: params.threadId, owner });
      await CommentsTableTestHelper.addComment({
        owner,
        isDeleted: true,
        id: params.commentId,
        threadId: params.threadId,
      });

      // Action
      const repositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Assert
      const notFoundError = 'komentar tidak ada atau telah dihapus';
      await expect(repositoryPostgres.verifyCommentNotDeleted(params.commentId))
        .rejects.toThrow(new NotFoundError(notFoundError));
    });
  });

  describe('softDeleteById function', () => {
    it('should delete comment (set is_deleted to true) when id and owner is valid and verify the action is correct', async () => {
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
      const repositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const softDelete = await repositoryPostgres.softDeleteById(params.commentId);

      // Assert
      const comment = await CommentsTableTestHelper.findCommentById(params.commentId);
      expect(softDelete).toBeUndefined();
      expect(comment).toHaveLength(1);
      expect(comment).toMatchObject([
        {
          owner,
          id: params.commentId,
          thread_id: params.threadId,
          is_deleted: true,
        },
      ]);
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
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const detailComment = await commentRepositoryPostgres.getCommentsByThreadId(thread.id);

      // Assert
      expect(detailComment).toBeDefined();
      expect(detailComment).toHaveLength(0);
    });

    it('should correctly return detail all comments (includes deleted comment) and order comments by date (asc)', async () => {
      // Arrange
      const date = (new Date()).toISOString();
      const user = {
        one: { id: 'user-abc', username: 'johndoe' },
        two: { id: 'user-123', username: 'dicoding' },
      };
      const threadId = 'thread-123';
      const comments = [
        {
          id: 'comment-xxx',
          content: 'Hello world',
          username: user.one.username,
          date,
        },
        {
          id: 'comment-abc',
          content: 'Sebuah komentar',
          username: user.two.username,
          date,
        },
        {
          id: 'comment-123',
          content: 'Content dari komentar',
          username: user.one.username,
          date: '2022-01-01',
        },
      ];

      /* add required data to database and create repository instance */
      await UsersTableTestHelper.addUser(user.one);
      await UsersTableTestHelper.addUser(user.two);
      await ThreadsTableTestHelper.addThreads({ id: threadId, owner: user.two.id });
      await CommentsTableTestHelper.addComment({ threadId, owner: user.one.id, ...comments[0] });
      await CommentsTableTestHelper.addComment({ threadId, owner: user.two.id, ...comments[1] });
      await CommentsTableTestHelper.addComment({ threadId, owner: user.one.id, ...comments[2] });
      const repositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      /* random deleting comment and get all comments belong the thread */
      await CommentsTableTestHelper.deleteCommentById(comments[2].id);
      const detailComment = await repositoryPostgres.getCommentsByThreadId(threadId);

      // Assert
      const deletedContent = '**komentar telah dihapus**';
      expect(detailComment).toHaveLength(comments.length);
      expect(detailComment[0]).toBeInstanceOf(DetailComment);
      expect(detailComment[1]).toBeInstanceOf(DetailComment);
      expect(detailComment[2]).toBeInstanceOf(DetailComment);

      comments.forEach((comment, index) => {
        expect(detailComment[index]).toHaveProperty('id', comment.id);
        expect(detailComment[index]).toHaveProperty('username', comment.username);
        expect(detailComment[index]).toHaveProperty('content');
        expect(detailComment[index]).toHaveProperty('date');
        expect(detailComment[index].date).toBeTruthy();
        expect(typeof detailComment[index].date).toBe('string');
      });

      expect(detailComment[0].content).toStrictEqual(comments[0].content);
      expect(detailComment[1].content).toStrictEqual(comments[1].content);
      expect(detailComment[2].content).toStrictEqual(deletedContent);
    });
  });
});
