const path = require('path');
const portfinder = require('portfinder');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

const BUILD_DIR = path.resolve(__dirname, 'build');
const APP_DIR = path.resolve(__dirname, 'components');
const DEFAULT_PORT = 5000;
const API_PORT = Number(process.env.PORT || 8080);

module.exports = async (env, argv = {}) => {
  try {
    const port = await portfinder.getPortPromise({ port: DEFAULT_PORT });
    const isProduction =
      argv.mode === 'production' || process.env.NODE_ENV === 'production';

    return {
      entry: path.resolve(APP_DIR, 'Main.js'),
      mode: isProduction ? 'production' : 'development',
      devServer: {
        static: { directory: BUILD_DIR },
        port,
        hot: true,
        historyApiFallback: true,
        proxy: [
          {
            context: ['/api'],
            target: `http://localhost:${API_PORT}`,
          },
        ],
      },
      output: {
        path: BUILD_DIR,
        publicPath: '/',
        filename: isProduction ? 'js/[name].[contenthash].js' : 'js/[name].js',
        chunkFilename: isProduction
          ? 'js/[name].[contenthash].chunk.js'
          : 'js/[name].chunk.js',
      },
      plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
          template: path.resolve(__dirname, 'public/index.html'),
          favicon: path.resolve(__dirname, 'public/favicon.ico'),
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
            use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
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
        minimize: isProduction,
        minimizer: [
          new TerserPlugin(),
          new ImageMinimizerPlugin({
            test: /\.(jpe?g|png|gif|svg)$/i,
            include: path.resolve(__dirname, 'src/assets/images'),
            minimizer: [
              {
                implementation: ImageMinimizerPlugin.imageminMinify,
                options: {
                  plugins: [
                    ['gifsicle', { interlaced: true }],
                    ['jpegoptim', { progressive: true }],
                    ['optipng', { optimizationLevel: 5 }],
                    [
                      'svgo',
                      {
                        plugins: [
                          { removeViewBox: false },
                          { removeEmptyAttrs: true },
                        ],
                      },
                    ],
                  ],
                },
              },
            ],
          }),
        ],
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
      },
      resolve: {
        extensions: ['.js', '.jsx'],
        modules: [path.resolve(__dirname, 'node_modules'), 'node_modules'],
      },
      devtool: isProduction ? false : 'source-map',
    };
  } catch (err) {
    console.error('Error finding an available port:', err);
    process.exit(1);
  }
};
