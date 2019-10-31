'use strict'

const paths = require('./paths')
const path = require('path')
// style files regexes
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const getCSSModuleLocalIdent = require('react-dev-utils/getCSSModuleLocalIdent')
const getStyleLoaders = require('./util').getStyleLoaders
const WorkboxPlugin = require('workbox-webpack-plugin'); // https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin
const isDev = process.env.NODE_ENV === 'development'

const webpackModule = {
  strictExportPresence: true,
  rules: [
    { parser: { requireEnsure: false } },
    {
      oneOf: [
        {
          test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
          loader: require.resolve('url-loader'),
          options: {
            limit: 10000,
            name: 'static/media/[name].[hash:8].[ext]'
          }
        },
        {
          test: /\.(js|mjs|jsx|ts|tsx)$/,
          exclude: /node_modules/,
          loader: require.resolve('babel-loader'),
          options: {
            cacheDirectory: true,
            cacheCompression: false,
            presets: [
              [
                require.resolve('@babel/preset-env'),
                {
                  modules: 'false'
                }
              ],
              require.resolve('@babel/preset-react')
            ],
            plugins: [
              require.resolve('@babel/plugin-transform-runtime')
            ]
          }
        },
        {
          test: /\.css$/,
          exclude: /\.module\.css$/,
          use: getStyleLoaders({
            importLoaders: 1
          })
        },
        {
          test: /\.module\.css$/,
          use: getStyleLoaders({
            importLoaders: 1,
            modules: true,
            getLocalIdent: getCSSModuleLocalIdent
          })
        },
        {
          test: /\.less$/,
          exclude: /\.module\.less$/,
          use: getStyleLoaders(
            {
              importLoaders: 2,
              localIdentName: '[local]'
            },
            'less-loader'
          ),
          sideEffects: true
        },
        {
          test: /\.module\.less$/,
          use: getStyleLoaders(
            {
              importLoaders: 2,
              modules: true,
              getLocalIdent: getCSSModuleLocalIdent
            },
            'less-loader'
          )
        },
        {
          exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
          loader: require.resolve('file-loader'),
          options: {
            name: 'static/media/[name].[hash:8].[ext]'
          }
        }
      ]
    }
  ]
}

module.exports = {
  stats: {
    children: false,
    entrypoints: false
  },
  mode: process.env.NODE_ENV,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../web')
    },
    extensions: paths.moduleFileExtensions
      .map(ext => `.${ext}`)
  },
  module: webpackModule,
  plugins: [
    new MiniCssExtractPlugin({
      filename: isDev ? 'static/css/[name].css' : 'static/css/[name].[hash:8].css',
      chunkFilename: isDev ? 'static/css/[name].chunk.css' : 'static/css/[name].chunk.[hash:8].css'
    }),
    new WorkboxPlugin.GenerateSW({
      swDest: 'service-worker.js',
      importWorkboxFrom: 'local',
      skipWaiting: true,
      clientsClaim: true,
      // exclude: [/\/static\//, /\.(js|css|media)$/],
      importsDirectory: 'service-worker-assets',
      // ignoreURLParametersMatching:  [/./],
      // cacheId: 'localhost01',
      cleanupOutdatedCaches: true,
      templatedURLs: {
        // '/app-shell': [
        //   'dev/templates/app-shell.hbs',
        //   'dev/**/*.css',
        //   ],
        '/': 'indexHtml',
      },
      runtimeCaching: [
        {
          urlPattern: /(\.js|\.css)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'static',
            cacheableResponse: {
              statuses: [0, 200]
            },
            expiration: {
              maxEntries: 60*60
            }
          }
        }
      ]
    })
  ],
  performance: false
}
