const path = require('path')
const webpack = require('webpack')
const frontendConfig = require('./dadi/frontend/lib/config-frontend')
//const HtmlWebpackPlugin = require('html-webpack-plugin')

const ENV = process.env.NODE_ENV || 'development'

module.exports = {
  entry:  path.resolve(__dirname, 'dadi/frontend/index.jsx'),

  output: {
    path: path.resolve(__dirname, 'public'),
    publicPath: '/',
    filename: 'bundle.js'
  },

  resolve: {
    extensions: ['', '.jsx', '.js', '.json', '.scss'],

    modulesDirectories: [
      path.resolve(__dirname, 'dadi/frontend/src/lib'),
      path.resolve(__dirname, 'dadi/frontend/src/components'),
      path.resolve(__dirname, 'dadi/frontend/src/views'),
      path.resolve(__dirname, 'dadi/frontend/src/store'),
      path.resolve(__dirname, 'node_modules'),
      'node_modules'
    ],

    alias: {
      lib: path.resolve(__dirname, 'dadi/frontend/src/lib'),
      containers: path.resolve(__dirname, 'dadi/frontend/src/containers'),
      components: path.resolve(__dirname, 'dadi/frontend/src/components'),
      views: path.resolve(__dirname, 'dadi/frontend/src/views'),
      'react': 'preact-compat',
      'react-router': 'preact-router',
      'react-redux': 'preact-redux',
      'react-dom': 'preact-compat'
    }
  },

  plugins: ([
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify({ NODE_ENV: ENV })
    }),
    new webpack.DefinePlugin({
      'config': JSON.stringify(frontendConfig)
    })
    // new HtmlWebpackPlugin({
    //   template: './dadi/frontend/index.html',
    //   minify: { collapseWhitespace: true }
    // })
  ]).concat(ENV === 'production' ? [
    new webpack.optimize.OccurenceOrderPlugin()
  ] : []),

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
        test: /\.scss$/,
        loader: "style-loader!css-loader!sass-loader"
      }
    ]
  }
}
