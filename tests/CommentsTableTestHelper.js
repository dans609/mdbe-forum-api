/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async addComment({
    id = 'comment-123',
    threadId = 'thread-123',
    content = 'Content dari komentar',
    owner = 'user-123',
    date = '12-30-2022',
    isDeleted = false,
  }) {
    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, threadId, content, owner, date, isDeleted],
    };

    await pool.query(query);
  },

  async getCommentIdByFks({ threadId, owner }) {
    const query = {
      text: 'SELECT comments.id FROM comments WHERE thread_id = $1 AND owner = $2',
      values: [threadId, owner],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async getAllCommentsInThread(threadId) {
    const query = {
      text: `SELECT comments.*, users.username
             FROM comments
             INNER JOIN users ON comments.owner = users.id
             WHERE thread_id = $1
             ORDER BY comments.date ASC`,
      values: [threadId],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async findCommentById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments');
  },
};

module.exports = CommentsTableTestHelper;
