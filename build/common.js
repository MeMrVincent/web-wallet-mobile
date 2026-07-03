const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const config = require('../config');
const webpack = require('webpack');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const AutoImport = require('unplugin-auto-import/webpack');
const Components = require('unplugin-vue-components/webpack');
const { VantResolver } = require('@vant/auto-import-resolver');
//const os = require('os');
//const threads = os.cpus().length > 4 ? 4 : os.cpus().length;
const threads = 2;

module.exports = () => {
  return {
    context: path.resolve(__dirname, '../'),
    entry: './' + config.build.sysApp + '/main.js',
    stats: 'errors-warnings',
    externals: {
      axios: 'axios',
    },
    output: {
      filename: 'assets/js/[name].[chunkhash].js',
      chunkFilename: 'assets/js/[name].[chunkhash].js',
      path: path.resolve(__dirname, '../dist'),
    },
    resolve: {
      fallback: {
        //crypto: require.resolve('crypto-browserify'),
        //stream: require.resolve('stream-browserify'),
        //buffer: require.resolve('buffer/'),
        //fs: false,
        //net: false,
        //tls: false,
      },
      extensions: [
        '.vue', '.js', '.jsx', '.json', '.css', '.ts', '.tsx', '.mjs', '.less', '.sass',
      ],
      alias: {
        '@': path.join(__dirname, '../public'),
        '@utils': path.join(__dirname, '../public/utils'),
        '@web3': path.join(__dirname, '../public/web3'),
        '@App': path.join(__dirname, '../dungeondual'),
        '@m4m': path.join(__dirname, '../m4m'),
      },
      aliasFields: ['browser', 'browser.esm'] /** Alias field **/,
      modules: ['node_modules'], /** Absolute resolution paths **/
    },
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader',
        },
        {
          test: /\.mjs$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
              plugins: ['@babel/plugin-transform-class-properties'],
            },
          },
        },
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: [{
            loader: 'thread-loader',
            options: {
              workers: threads,
            },
          },
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
              plugins: [['@babel/plugin-transform-runtime',
                { corejs: 3 }]],
            },
          }],
          type: 'javascript/auto',
        },
        {
          test: /\.tsx?$/,
          use: [{
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          }],
        },
        {
          test: /\.(png|svg|jpg|gif|webp)$/,
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: 6 * 1024,
            },
          },
        },
      ],
    },
    plugins: [
      new NodePolyfillPlugin(),
      new VueLoaderPlugin(),
      new CopyWebpackPlugin({
        patterns: [{
          from: path.resolve(__dirname, '../static'),
          to: config.build.assetsSubDirectory,
        }],
      }),
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
      //AutoImport.default({ resolvers: [ElementPlusResolver()] }),
      //Components.default({ resolvers: [ElementPlusResolver()] }),
      AutoImport({
        imports: ['vue', 'vue-router', 'vue-i18n'],
        resolvers: [VantResolver()]
      }),
      Components({ resolvers: [VantResolver()] }),
      new webpack.DefinePlugin({
        __VUE_OPTIONS_API__: JSON.stringify(true),
        __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),
      }),
    ],
  };
};

