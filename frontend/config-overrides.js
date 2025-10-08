const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = function override(config) {
  // Add fallbacks for Node.js modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "net": false,
    "tls": false,
    "dns": false,
    "fs": false,
    "crypto": require.resolve("crypto-browserify"),
    "stream": require.resolve("stream-browserify"),
    "buffer": require.resolve("buffer/"),
    "util": require.resolve("util/"),
    "process/browser": require.resolve("process/browser.js"),
  };

  // Disable fully specified imports for .mjs files
  config.module.rules.push({
    test: /\.m?js$/,
    resolve: {
      fullySpecified: false,
    },
  });

  // Provide global polyfills
  config.plugins.push(
    new webpack.ProvidePlugin({
      process: 'process/browser.js',
      Buffer: ['buffer', 'Buffer'],
    })
  );

  // Ensure HtmlWebpackPlugin is properly configured
  const htmlPluginIndex = config.plugins.findIndex(
    plugin => plugin instanceof HtmlWebpackPlugin
  );
  
  if (htmlPluginIndex === -1) {
    config.plugins.push(
      new HtmlWebpackPlugin({
        template: 'public/index.html',
        inject: true,
      })
    );
  }

  return config;
};

