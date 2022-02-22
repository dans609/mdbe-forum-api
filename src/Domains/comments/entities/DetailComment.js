class DetailComment {
  constructor(responses) {
    this._verifyResponse(responses);

    const {
      id, content, username, date, is_deleted: isDeleted,
    } = responses;
    this.id = id;
    this.username = username;
    this.date = date;
    this.content = content;

    this._deleteContent(isDeleted);
  }

  _deleteContent(isDeleted) {
    if (isDeleted) this.content = '**komentar telah dihapus**';
  }

  _verifyResponse(res) {
    const allowedProperties = ['id', 'username', 'date', 'content'];
    if (!res.id || !res.content || !res.username || !res.date || res.is_deleted === undefined) {
      throw new Error('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof res.is_deleted !== 'boolean') {
      throw new Error('DETAIL_COMMENT.IS_DELETED_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    const keys = Object.keys(res);
    keys.forEach((key) => {
      if (allowedProperties.indexOf(key) > -1) {
        if (typeof res[key] !== 'string') {
          throw new Error('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
        }
      }
    });
  }
}

module.exports = DetailComment;
