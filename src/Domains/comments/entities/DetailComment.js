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
    const propertyError = 'DETAIL_COMMENT.RESPONSES_NOT_CONTAIN_NEEDED_PROPERTY';
    const propertyIsDeletedTypeError = 'DETAIL_COMMENT.PROPERTY_IS_DELETED_NOT_MEET_DATA_TYPE_SPECIFICATION';
    const propertyIsNotStringTypeError = 'DETAIL_COMMENT.RESPONSES_NOT_MEET_DATA_TYPE_SPECIFICATION';

    const isPropertyError = res.is_deleted === undefined
      || !res.id
      || !res.content
      || !res.username
      || !res.date;
    const isDeletedTypeError = typeof res.is_deleted !== 'boolean';
    const isNotStringTypeError = typeof res.id !== 'string'
      || typeof res.content !== 'string'
      || typeof res.username !== 'string'
      || typeof res.date !== 'string';

    if (isPropertyError) throw new Error(propertyError);
    if (isDeletedTypeError) throw new Error(propertyIsDeletedTypeError);
    if (isNotStringTypeError) throw new Error(propertyIsNotStringTypeError);
  }
}

module.exports = DetailComment;
