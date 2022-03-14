const routes = (handler) => ([
  {
    method: 'POST',
    path: '/threads',
    options: { auth: 'forumapi_jwt' },
    handler: handler.postThreadHandler,
  },
  {
    method: 'GET',
    path: '/threads/{threadId}',
    handler: handler.getThreadHandler,
  },
]);

module.exports = routes;
