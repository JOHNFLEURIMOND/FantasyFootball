const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://replay.sportsdata.io', // Adjust target to your actual API server
      changeOrigin: true,
      pathRewrite: {
        '^/api': '', // Remove '/api' from the start of the path
      },
      onProxyReq: (proxyReq, req, res) => {
        // Set your API key here, if needed
        proxyReq.setHeader(
          'Authorization',
          `Bearer ${process.env.REACT_APP_MY_API_KEY}`
        );
      },
    })
  );
};
