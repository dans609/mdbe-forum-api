const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const PostThread = require('../../../Domains/threads/entities/PostThread');
const PostedThread = require('../../../Domains/threads/entities/PostedThread');
const GetThread = require('../../../Domains/threads/entities/GetThread');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('ThreadRepositoryPostgres', () => {
  it('should be instanceof ThreadRepository interface', () => {
    const threadRepository = new ThreadRepositoryPostgres(pool, {});
    expect(threadRepository).toBeInstanceOf(ThreadRepository);
  });

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
      const payload = { title: 'Thread Title', body: 'Thread body' };
      const userId = 'user-123';
      const postThread = new PostThread(payload, userId);
      await UsersTableTestHelper.addUser({ username: 'dicoding', id: userId });

      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await threadRepositoryPostgres.addThread({ ...postThread });

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(threads).toHaveLength(1);
    });

    it('should return posted thread correctly', async () => {
      // Arrange
      const payload = { title: 'Thread Title', body: 'Thread body' };
      const userId = 'user-123';
      const postThread = new PostThread(payload, userId);
      await UsersTableTestHelper.addUser({ username: 'dicoding' });

      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const postedThread = await threadRepositoryPostgres.addThread({ ...postThread });

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
      const date = (new Date()).toISOString();
      const { threadId } = new GetThread({ threadId: 'thread-123' });
      const userId = 'user-123';
      const responses = {
        id: threadId,
        title: 'Thread Title',
        body: 'Thread body',
        username: 'dicoding',
        date,
      };
      const expectedDetailThread = new DetailThread(responses);

      /* add required data to database and create repository instance */
      await UsersTableTestHelper.addUser({ id: userId, username: 'dicoding' });
      await ThreadsTableTestHelper.addThreads({ ...expectedDetailThread, owner: userId });
      const repositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const detailThread = await repositoryPostgres.getThreadById(threadId);

      // Assert
      expect(detailThread).toBeInstanceOf(DetailThread);
      expect(detailThread.id).toStrictEqual(expectedDetailThread.id);
      expect(detailThread.title).toStrictEqual(expectedDetailThread.title);
      expect(detailThread.body).toStrictEqual(expectedDetailThread.body);
      expect(detailThread.username).toStrictEqual(expectedDetailThread.username);
      expect(detailThread.date).toBeTruthy();
      expect(typeof detailThread.date).toStrictEqual('string');
    });
  });

  describe('verifyThreadById function', () => {
    it('should throw NotFoundError when thread not exist or thread ID is wrong', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      await ThreadsTableTestHelper.addThreads({ id: 'thread-123' });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

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
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

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
