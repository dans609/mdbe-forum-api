/* istanbul ignore file */
const RequestTestHelper = {
  payload: '',
  params: '',
  headers: '',
  owner: '',

  setData({
    payload = '',
    params = '',
    headers = '',
    owner = '',
  }) {
    this.payload = payload;
    this.params = params;
    this.headers = headers;
    this.owner = owner;

    return this;
  },

  cleanData() {
    this.payload = '';
    this.params = '';
    this.headers = '';
    this.owner = '';

    return this;
  },
};

module.exports = RequestTestHelper;
