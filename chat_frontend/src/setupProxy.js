const { createProxyMiddleware } = require("http-proxy-middleware");

/*module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:8080/",
      changeOrigin: true,
    })
  );
};*/

module.exports = function (app) {
  app.use(
    '/api',
    proxy({
      target: 'http://localhost:8080/',
      changeOrigin: true,
    })
  );

  // Proxy WebSocket requests
  app.use(
    '/ws',
    proxy({
      target: 'http://localhost:8080/',
      ws: true,  // Enable WebSocket proxying
      changeOrigin: true,
    })
  );
};
