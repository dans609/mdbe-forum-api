const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const PostedThread = require('../../Domains/threads/entities/PostedThread');
const DetailThread = require('../../Domains/threads/entities/DetailThread');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread({ title, body, userId: owner }) {
    const id = `thread-${this._idGenerator()}`;
    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4) RETURNING id, title, owner',
      values: [id, title, body, owner],
    };

    const result = await this._pool.query(query);
    return new PostedThread({ ...result.rows[0] });
  }

  async getThreadById(id) {
    const query = {
      text: ` SELECT threads.id, threads.title, threads.body, threads.date, users.username
              FROM threads
              INNER JOIN users ON threads.owner = users.id
              WHERE threads.id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);
    const thread = result.rows[0];
    return new DetailThread({
      ...thread, date: thread.date.toISOString(),
    });
  }

  async verifyThreadById(id) {
    const query = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('thread tidak ditemukan atau id yang dimasukkan salah');
    }
  }
}

module.exports = ThreadRepositoryPostgres;
