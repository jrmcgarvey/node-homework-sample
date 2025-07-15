const wrapRoutes = (router) => {
  const methods = ['get', 'post', 'put', 'delete', 'patch'];
  for (const method of methods) {
    const original = router[method];
    router[method] = function (path, ...handlers) {
      return original.call(
        router,
        path,
        ...handlers.map((h) => (h.constructor.name === 'AsyncFunction' ? asyncHandler(h) : h))
      );
    };
  }
  return router;
};

module.exports=wrapRoutes;