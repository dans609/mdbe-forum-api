const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const PostThread = require('../../../Domains/threads/entities/PostThread');
const PostedThread = require('../../../Domains/threads/entities/PostedThread');
const GetThread = require('../../../Domains/threads/entities/GetThread');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist post thread', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      const payload = { title: 'Thread Title', body: 'Thread body' };
      const userId = 'user-123';
      const postThread = new PostThread(payload, userId);

      function date() { this.toISOString = () => '12-30-2022'; }
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, date, fakeIdGenerator);

      // Action
      await threadRepositoryPostgres.addThread({ ...postThread, owner: userId });

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(threads).toHaveLength(1);
    });

    it('should return posted thread correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      const payload = { title: 'Thread Title', body: 'Thread body' };
      const userId = 'user-123';
      const postThread = new PostThread(payload, userId);

      function date() { this.toISOString = () => '12-30-2022'; }
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, date, fakeIdGenerator);

      // Action
      const postedThread = await threadRepositoryPostgres.addThread({
        ...postThread, owner: userId,
      });

      // Assert
      expect(postedThread).toStrictEqual(new PostedThread({
        id: 'thread-123',
        title: 'Thread Title',
        owner: 'user-123',
      }));
    });
  });

  describe('getThreadById function', () => {
    it('should return detail thread correctly', async () => {
      // Arrange
      const { threadId } = new GetThread({ threadId: 'thread-123' });
      const userId = 'user-123';
      const responses = {
        id: threadId,
        title: 'Thread Title',
        body: 'Thread body',
        username: 'dicoding',
        date: '12-29-2022',
      };
      const expectedDetailThread = new DetailThread(responses);

      /* add required data to database and create repository instance */
      await UsersTableTestHelper.addUser({ id: userId, username: 'dicoding' });
      await ThreadsTableTestHelper.addThreads({ ...expectedDetailThread, owner: userId });
      const threadRepoPostgres = new ThreadRepositoryPostgres(pool, {}, {});

      // Action
      const detailThread = await threadRepoPostgres.getThreadById(threadId);

      // Assert
      expect(detailThread).toStrictEqual(expectedDetailThread);
    });
  });

  describe('verifyThreadById function', () => {
    it('should throw NotFoundError when thread not exist or thread ID is wrong', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      await ThreadsTableTestHelper.addThreads({ id: 'thread-123' });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {}, {});

      // Action and Assert
      await expect(threadRepositoryPostgres.verifyThreadById('thread-abc'))
        .rejects
        .toThrow(NotFoundError);
      await expect(threadRepositoryPostgres.verifyThreadById('thread-abc'))
        .rejects
        .toThrowError('thread tidak ditemukan atau id yang dimasukkan salah');
    });

    it('shouldn\'t throw NotFoundError if thread is exist or thread ID is correct', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      await ThreadsTableTestHelper.addThreads({ id: 'thread-123' });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {}, {});

      // Action and Assert
      await expect(threadRepositoryPostgres.verifyThreadById('thread-123'))
        .resolves
        .not.toThrow(NotFoundError);
      await expect(threadRepositoryPostgres.verifyThreadById('thread-123'))
        .resolves
        .toBeUndefined();
    });
  });
});
