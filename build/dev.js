const webpack = require('webpack');
const { merge } = require('webpack-merge');
const common = require('./common.js');
const path = require('path');
const FriendlyErrorsWebpackPlugin = require('@soda/friendly-errors-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const envConfig = require('../config/env.conf');
const BuildENV = envConfig.getBuildENV({
  NODE_ENV: '"development"',
  prod: '"dev"',
});
const devHost = process.env.HOST || BuildENV.host;
const devPort = Number(process.env.PORT || BuildENV.port);

module.exports = (RESETENV) => {
  return merge(common(RESETENV), {
    target: 'web',
    mode: 'development',
    devtool: 'eval-cheap-module-source-map',
    devServer: {
      hot: true,
      open: true,
      host: devHost,
      port: devPort,
      historyApiFallback: {
        rewrites: [
          { from: /.*/, to: path.posix.join('/', 'index.html') },
        ],
      },
      server: BuildENV.server,
      static: {
        //directory: path.join(__dirname, 'public'),
        serveIndex: false,
      },
      client: {
        reconnect: false,
        overlay: {
          errors: true,
          warnings: false,
          runtimeErrors: false,
        },
      },
      ...(BuildENV.apiURL ? {
        proxy: [
          {
            context: ['/api'],
            target: BuildENV.apiURL,
            changeOrigin: true,
            pathRewrite: { '^/api': '' },
          },
        ],
      } : {}),
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                esModule: false,
                modules: {
                  auto: false,
                  localIdentName: '[local]_[hash:base64:8]',
                },
              },
            },
          ],
        },
        {
          test: /\.scss$/,
          use: ['style-loader', 'css-loader', 'sass-loader'],
        },
        {
          test: /\.less$/,
          use: ['style-loader', 'css-loader', 'less-loader'],
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': envConfig.getNodeENV({
          NODE_ENV: '"development"',
          prod: '"dev"',
        }),
        'process.env.NODE_ENV': BuildENV.NODE_ENV,
      }),
      new HtmlWebpackPlugin({
        template: './' + BuildENV.sysApp + '/' + BuildENV.filename,
        filename: 'index.html',
        title: BuildENV.title,
        inject: true,
        prod: false,
        vConsole: true,
        staticURL: BuildENV.staticURL,
        webURL: BuildENV.webURL,
      }),
      new FriendlyErrorsWebpackPlugin({
        compilationSuccessInfo: {
          messages: [`Your application is running here: http://${devHost}:${devPort}`],
        },
        onErrors: undefined,
        clearConsole: true,
      }),
    ],
  });
};

