const LikeRepository = require('../../Domains/likes/LikeRepository');
const GetLike = require('../../Domains/likes/entities/GetLike');

class LikeRepositoryPostgres extends LikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addLike({ threadId, commentId, userId: owner }) {
    const id = `like-${this._idGenerator()}`;
    const query = {
      text: 'INSERT INTO likes VALUES($1, $2, $3, $4)',
      values: [id, threadId, commentId, owner],
    };

    await this._pool.query(query);
  }

  async deleteLike({ threadId, commentId, userId: owner }) {
    const query = {
      text: 'DELETE FROM likes WHERE thread_id = $1 AND comment_id = $2 AND owner = $3',
      values: [threadId, commentId, owner],
    };

    await this._pool.query(query);
  }

  async getLikesInComment(commentId) {
    const query = {
      text: 'SELECT id, comment_id FROM likes WHERE comment_id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);
    return new GetLike(result.rows);
  }

  async verifyLikeAvailability({ threadId, commentId, userId: owner }) {
    const query = {
      text: 'SELECT id FROM likes WHERE thread_id = $1 AND comment_id = $2 AND owner = $3',
      values: [threadId, commentId, owner],
    };

    const result = await this._pool.query(query);
    return !!result.rowCount;
  }
}

module.exports = LikeRepositoryPostgres;
