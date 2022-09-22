const path = require("path");
const webpack = require("webpack");
const BUILD_DIR = path.resolve(__dirname, "./build");
const APP_DIR = path.resolve(__dirname, "./components");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
require('dotenv').config({ path: './.env' });

module.exports = {
  entry: {
    main: ["@babel/polyfill", path.resolve(APP_DIR + "/Main.js")],
  },
  mode: "development",
  devServer: {
    static: BUILD_DIR + "index/html",
    port: 5000,
  },
  output: {
    path: path.resolve(BUILD_DIR),
    publicPath: "/",
    filename: "bundle.js",
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: path.resolve(BUILD_DIR, "index.html"),
      favicon: "public/favicon.ico",
      // Load a custom template (lodash by default)
      template: "index.html",
    }),
    new webpack.DefinePlugin({
      APP_VERSION:
        JSON.stringify(process.env.APP_VERSION) || JSON.stringify("config"),
    }),
    new webpack.DefinePlugin({
      "process.env": JSON.stringify(process.env),
    }),
    new MiniCssExtractPlugin({
      filename: 'bundle.css'
    })
  ],
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.(js|jsx)?$/,
        use: [
          {
            loader: require.resolve("babel-loader"),
          },
        ],
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
          },
        ],
      },
      {
        test: /\.(sa|sc|c)ss$/,
        exclude: /node_modules/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.(jpe?g|gif|png|svg)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              name: '[name]-[hash].[ext]'
            }
          }
        ]
      }
    ],
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        styles: {
          name: 'styles',
          test: /\.css$/,
          chunks: 'all',
          enforce: true
        }
      }
    }
  },
  resolve: {
    extensions: [".jsx", ".js"],
  },
};