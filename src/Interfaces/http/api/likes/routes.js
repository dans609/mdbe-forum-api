const routes = (handler) => ([
  {
    method: 'PUT',
    path: '/threads/{threadId}/comments/{commentsId}/likes',
    options: { auth: 'forumapi_jwt' },
    handler: handler.putLikeHandler,
  },
]);

module.exports = routes;
