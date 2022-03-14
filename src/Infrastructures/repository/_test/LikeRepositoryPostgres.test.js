const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const PutLike = require('../../../Domains/likes/entities/PutLike');
const GetLike = require('../../../Domains/likes/entities/GetLike');
const pool = require('../../database/postgres/pool');
const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');

describe('LikeRepositoryPostgres', () => {
  it('should be instanceof LikeRepository interface', () => {
    const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});
    expect(likeRepositoryPostgres).toBeInstanceOf(LikeRepository);
  });

  const generateData = () => ({
    fakeIdGenerator: { first: () => '123', second: () => '234', third: () => '345' },
    params: { threadId: 'thread-123', commentId: 'comment-123' },
    users: {
      first: { id: 'user-123', username: 'dicoding' },
      second: { id: 'user-abc', username: 'johndoe' },
      third: { id: 'user-def', username: 'dans' },
    },
  });

  beforeEach(async () => {
    const { users } = generateData();
    await UsersTableTestHelper.addUser(users.first);
    await UsersTableTestHelper.addUser(users.second);
    await UsersTableTestHelper.addUser(users.third);
    await ThreadsTableTestHelper.addThreads({ id: 'thread-123', owner: 'user-123' });
    await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await LikesTableTestHelper.cleanTable();
  });

  describe('addLike function', () => {
    it('should persist add likes in database', async () => {
      // Arrange
      const { users, params, fakeIdGenerator } = generateData();
      const { users: cloneUsers, params: cloneParams } = generateData();
      const likeCommentByFirstUser = new PutLike(params, users.first.id);
      const likeCommentBySecondUser = new PutLike(params, users.second.id);
      const likeCommentByThirdUser = new PutLike(params, users.third.id);

      // Action
      /** adding first @like to database */
      const firstRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator.first);
      await firstRepositoryPostgres.addLike(likeCommentByFirstUser);

      /** adding second @like to database */
      const secondRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator.second);
      await secondRepositoryPostgres.addLike(likeCommentBySecondUser);

      /** adding third @like to database */
      const thirdRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator.third);
      await thirdRepositoryPostgres.addLike(likeCommentByThirdUser);

      // Assert
      const likes = await LikesTableTestHelper.getListLikesInComment(cloneParams);
      expect(likes).toHaveLength(3);

      likes.forEach((like) => {
        expect(like.date).toBeInstanceOf(Date);
        expect(like.date.toISOString()).toBeTruthy();
        expect(typeof like.date.toISOString()).toStrictEqual('string');
        expect(like.thread_id).toStrictEqual(cloneParams.threadId);
        expect(like.comment_id).toStrictEqual(cloneParams.commentId);
      });

      /** @toMatchObject is prefered because the value of property 'date' is not static */
      expect(likes).toMatchObject([
        { id: 'like-123', owner: cloneUsers.first.id },
        { id: 'like-234', owner: cloneUsers.second.id },
        { id: 'like-345', owner: cloneUsers.third.id },
      ]);
    });
  });

  describe('deleteLike function', () => {
    it('should delete like when foreignkey and id is correct', async () => {
      // Arrange
      const { users, params } = generateData();
      const { users: cloneUsers, params: cloneParams } = generateData();
      await LikesTableTestHelper.addLike({ id: 'like-123', owner: users.first.id, ...params });
      await LikesTableTestHelper.addLike({ id: 'like-234', owner: users.second.id, ...params });

      // Action
      const putLike = new PutLike(params, users.first.id);
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});
      await likeRepositoryPostgres.deleteLike(putLike);

      // Assert
      const likes = await LikesTableTestHelper.getListLikesInComment(cloneParams);
      expect(likes).toHaveLength(1);
      expect(likes[0].id).toStrictEqual('like-234');
      expect(likes[0].owner).toStrictEqual(cloneUsers.second.id);
      expect(likes[0].comment_id).toStrictEqual(cloneParams.commentId);
      expect(likes[0].thread_id).toStrictEqual(cloneParams.threadId);
      expect(likes[0].date).toBeInstanceOf(Date);
      expect(likes[0].date.toISOString()).toBeTruthy();
      expect(typeof likes[0].date.toISOString()).toStrictEqual('string');
    });
  });

  describe('getLikesInComment function', () => {
    it('should return getLike object correctly for comment that has been liked', async () => {
      // Arrange
      const { users, params } = generateData();
      await LikesTableTestHelper.addLike({ id: 'like-123', owner: users.first.id, ...params });
      await LikesTableTestHelper.addLike({ id: 'like-234', owner: users.second.id, ...params });
      await LikesTableTestHelper.addLike({ id: 'like-345', owner: users.third.id, ...params });

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const getLike = await likeRepositoryPostgres.getLikesInComment(params.commentId);

      // Assert
      const expectedLikes = await LikesTableTestHelper.getListLikesInComment(params);
      expect(getLike).toStrictEqual(new GetLike(expectedLikes));
      expect(getLike.likeCount).toEqual(3);
    });

    it('should return getLike object correctly for comment that has NOT been liked', async () => {
      // Arrange
      const { params } = generateData();
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const getLike = await likeRepositoryPostgres.getLikesInComment(params.commentId);

      // Assert
      const expectedLikes = await LikesTableTestHelper.getListLikesInComment(params);
      expect(getLike).toStrictEqual(new GetLike(expectedLikes));
      expect(getLike.likeCount).toEqual(0);
    });
  });

  describe('verifyLikeAvailability function', () => {
    it('should return FALSE when like is not exists in database', async () => {
      // Arrange
      const { users, params } = generateData();

      // Action
      const putLike = new PutLike(params, users.first.id);
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});
      const isAvailable = await likeRepositoryPostgres.verifyLikeAvailability(putLike);

      // Assert
      expect(typeof isAvailable).toStrictEqual('boolean');
      expect(isAvailable).toStrictEqual(false);
    });

    it('should return TRUE when like is exists in database', async () => {
      // Arrange
      const { users, params } = generateData();
      await LikesTableTestHelper.addLike({ id: 'like-123', owner: users.first.id, ...params });

      // Action
      const putLike = new PutLike(params, users.first.id);
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});
      const isAvailable = await likeRepositoryPostgres.verifyLikeAvailability(putLike);

      // Assert
      expect(typeof isAvailable).toStrictEqual('boolean');
      expect(isAvailable).toStrictEqual(true);
    });
  });
});
