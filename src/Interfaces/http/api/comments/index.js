const CommentsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'comments',
  register: async (server, { container, validator }) => {
    const commentHandler = new CommentsHandler(container, validator);
    server.route(routes(commentHandler));
  },
};
