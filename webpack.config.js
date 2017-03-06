'use strict'

const fs = require('fs')
const path = require('path')
const postcss = require('postcss')
const postcssCustomProperties = require('postcss-custom-properties')
const postcssCustomMedia = require('postcss-custom-media')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const WebpackOnBuildPlugin = require('on-build-webpack')

const ENV = process.env.NODE_ENV || 'production'
const ENABLE_SOURCE_MAP = (process.env.ENABLE_SOURCE_MAP !== false)

const PATH_CSS = 'main.css'
const PATH_PUBLIC = 'public'

module.exports = {
  plugins: ([
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify({ NODE_ENV: ENV })
    }),
    new ExtractTextPlugin(PATH_CSS),
    new WebpackOnBuildPlugin((stats) => {
      let fullCssPath = path.resolve(__dirname, PATH_PUBLIC, PATH_CSS)
      let css = fs.readFileSync(fullCssPath, 'utf8')
      let processedCss = postcss().use(postcssCustomProperties({
        preserve: true
      })).use(postcssCustomMedia()).process(css).css

      fs.writeFileSync(fullCssPath, processedCss)
    })
  ]).concat(ENV === 'production' ? [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      beautify: false,
      mangle: {
        screw_ie8: true,
        keep_fnames: true
      },
      compress: {
        screw_ie8: true,
        warnings: false
      },
      comments: false
    })
  ] : []),

  entry: path.resolve(__dirname, 'dadi/frontend/index.jsx'),

  devtool: ((ENV === 'development') && ENABLE_SOURCE_MAP) ? 'eval-cheap-module-source-map' : null,

  output: {
    path: path.resolve(__dirname, PATH_PUBLIC),
    publicPath: '/',
    filename: 'bundle.js'
  },

  resolve: {
    root: path.resolve(__dirname, 'dadi'),
    extensions: ['', '.jsx', '.js', '.json'],

    modulesDirectories: [
      'node_modules'
    ],

    alias: {
      lib: 'frontend/lib',
      containers: 'frontend/containers',
      components: 'frontend/components',
      views: 'frontend/views',
      actions: 'frontend/actions',
      reducers: 'frontend/reducers',
      'react': 'preact-compat',
      'react-router': 'preact-router',
      'react-router-redux': 'preact-router-redux',
      'react-redux': 'preact-redux',
      'react-dom': 'preact-compat',
      'fetch': 'unfetch/polyfill'
    }
  },

  stats: { colors: true },

  node: {
    global: true,
    process: false,
    Buffer: false,
    __filename: false,
    __dirname: false,
    setImmediate: false
  },

  module: {
    loaders: [
      {
        test: /\.jsx|js?$/,
        exclude: /node_modules/,
        cacheDirectory: true,
        loader: 'babel-loader'
      },
      {
        test: /\.svg|jpg$/,
        loader: 'url'
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)(\?.*$|$)/,
        loader: 'url-loader?limit=100000'
      },
      {
        test: /\.css$/,
        include: [path.resolve(__dirname, 'dadi/frontend')],
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss-loader')
      }
    ]
  },

  postcss: [
    require('autoprefixer')
  ]
}
