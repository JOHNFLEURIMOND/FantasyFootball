const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { DefinePlugin } = require('webpack');
require('dotenv').config({ path: './.env' });

const BUILD_DIR = path.resolve(__dirname, 'build');
const APP_DIR = path.resolve(__dirname, 'components');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: {
      main: ['@babel/polyfill', path.resolve(APP_DIR, 'Main.js')],
    },
    mode: isProduction ? 'production' : 'development',
    devServer: {
      static: {
        directory: BUILD_DIR,
        publicPath: '/',
      },
      port: 5000,
      hot: true,
      historyApiFallback: true,
    },
    output: {
      path: BUILD_DIR,
      publicPath: '/',
      filename: isProduction ? 'js/[name].[contenthash].js' : 'js/[name].js',
      chunkFilename: isProduction
        ? 'js/[name].[contenthash].chunk.js'
        : 'js/[name].chunk.js',
      assetModuleFilename: 'assets/images/[name].[hash][ext][query]',
    },
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: path.resolve(__dirname, 'public/index.html'),
        favicon: path.resolve(__dirname, 'public/favicon.ico'),
      }),
      new DefinePlugin({
        'process.env': JSON.stringify(process.env),
      }),
      new MiniCssExtractPlugin({
        filename: isProduction
          ? 'css/[name].[contenthash].css'
          : 'css/[name].css',
      }),
    ],
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react'],
              plugins: ['@babel/plugin-transform-runtime'],
            },
          },
        },
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            MiniCssExtractPlugin.loader, // Extract CSS into separate files
            'css-loader', // Resolves CSS imports
            'sass-loader', // Compiles SCSS to CSS
          ],
        },
        {
          test: /\.(jpe?g|gif|png|svg)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'assets/images/[name].[hash][ext][query]',
          },
        },
      ],
    },
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          styles: {
            name: 'styles',
            test: /\.(css|scss)$/,
            chunks: 'all',
            enforce: true,
          },
        },
      },
      runtimeChunk: {
        name: entryPoint => `runtime-${entryPoint.name}`,
      },
      minimize: isProduction,
    },
    resolve: {
      extensions: ['.js', '.jsx'],
    },
  };
};
