const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const DetailComment = require('../../Domains/comments/entities/DetailComment');
const PostedComment = require('../../Domains/comments/entities/PostedComment');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment({ threadId, content, userId: owner }) {
    const id = `comment-${this._idGenerator()}`;
    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4) RETURNING id, content, owner',
      values: [id, threadId, content, owner],
    };

    const result = await this._pool.query(query);
    return new PostedComment({ ...result.rows[0] });
  }

  async softDeleteById(commentId) {
    const query = {
      text: 'UPDATE comments SET is_deleted = TRUE WHERE id = $1 RETURNING is_deleted',
      values: [commentId],
    };

    await this._pool.query(query);
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: ` SELECT
                comments.id,
                comments.content,
                comments.date,
                comments.is_deleted,
                users.username
              FROM comments
              INNER JOIN users ON comments.owner = users.id
              WHERE comments.thread_id = $1
              ORDER BY comments.date ASC`,
      values: [threadId],
    };

    const result = await this._pool.query(query);
    return result.rows.map((row) => new DetailComment({
      ...row, date: row.date.toISOString(),
    }));
  }

  async verifyCommentNotDeleted(commentId) {
    const query = {
      text: 'SELECT is_deleted FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);
    const { is_deleted: isDeleted } = result.rows[0];
    if (isDeleted) throw new NotFoundError('komentar tidak ada atau telah dihapus');
  }

  async verifyCommentByThreadId({ commentId, threadId }) {
    const query = {
      text: ` SELECT comments.id, threads.id
              FROM comments
              INNER JOIN threads ON comments.thread_id = threads.id
              WHERE comments.id = $1 AND threads.id = $2`,
      values: [commentId, threadId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('komentar tidak ditemukan atau id yang dimasukkan salah');
    }
  }

  async verifyCommentOwner({ commentId, userId: owner }) {
    const query = {
      text: ` SELECT comments.id, users.id
              FROM comments
              INNER JOIN users ON comments.owner = users.id
              WHERE comments.id = $1 AND users.id = $2`,
      values: [commentId, owner],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new AuthorizationError('komentar tidak ditemukan atau owner salah');
    }
  }
}

module.exports = CommentRepositoryPostgres;
