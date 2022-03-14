/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const LikesTableTestHelper = {
  async addLike({
    id = 'likes-123',
    threadId = 'thread-123',
    commentId = 'comment-123',
    owner = 'user-123',
  }) {
    const query = {
      text: 'INSERT INTO likes VALUES($1, $2, $3, $4)',
      values: [id, threadId, commentId, owner],
    };

    await pool.query(query);
  },

  async getListLikesInComment({ threadId = 'thread-123', commentId = 'comment-123' }) {
    const query = {
      text: 'SELECT * FROM likes WHERE thread_id = $1 AND comment_id = $2',
      values: [threadId, commentId],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async getAllLikesInThread(threadId) {
    const query = {
      text: 'SELECT * FROM likes WHERE thread_id = $1',
      values: [threadId],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM likes');
  },
};

module.exports = LikesTableTestHelper;
