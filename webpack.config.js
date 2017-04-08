'use strict'

const fs = require('fs')
const path = require('path')
const postcss = require('postcss')
const postcssCustomMedia = require('postcss-custom-media')
const postcssCustomProperties = require('postcss-custom-properties')
const webpack = require('webpack')

const ComponentTreePlugin = require('component-tree-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const WebpackOnBuildPlugin = require('on-build-webpack')
const WebpackPreBuildPlugin = require('pre-build-webpack')

const ENV = process.env.NODE_ENV || 'production'
const ENABLE_SOURCE_MAP = (process.env.ENABLE_SOURCE_MAP !== false)
const PATHS = {
  COMPONENT_TREE: '/../component-map.json',
  COMPONENTS: path.resolve(__dirname, 'frontend/components'),
  CONTAINERS: path.resolve(__dirname, 'frontend/containers'),
  CSS: 'main.css',
  FIELD_COMPONENT_LIST: 'frontend/lib/field-components.json',
  PUBLIC: 'public',
  VIEWS: path.resolve(__dirname, 'frontend/views')
}

module.exports = {
  entry: path.resolve(__dirname, 'frontend/index.jsx'),

  devtool: ((ENV === 'development') && ENABLE_SOURCE_MAP) ? 'eval-cheap-module-source-map' : null,

  module: {
    rules: [
      {
        test: /\.jsx|js?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true
          }
        }
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)(\?.*$|$)/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 100000
          }
        }
      },
      {
        test: /\.css$/,
        include: [path.resolve(__dirname, 'frontend')],
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                modules: true,
                importLoaders: 1,
                localIdentName: '[name]__[local]___[hash:base64:5]'
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                plugins: function () {
                  return [
                    require('autoprefixer')
                  ]
                }
              }
            }
          ]
        })
      }
    ]
  },

  node: {
    global: true,
    process: false,
    Buffer: false,
    __filename: false,
    __dirname: false,
    setImmediate: false
  },

  output: {
    path: path.resolve(__dirname, PATHS.PUBLIC),
    publicPath: '/',
    filename: 'bundle.js'
  },

  plugins: ([
    new webpack.NoEmitOnErrorsPlugin(),

    new webpack.DefinePlugin({
      'process.env': JSON.stringify({ NODE_ENV: ENV })
    }),

    new ComponentTreePlugin({
      directories: [
        PATHS.COMPONENTS,
        PATHS.CONTAINERS,
        PATHS.VIEWS
      ],
      extensions: ['.jsx'],
      outputPath: PATHS.COMPONENT_TREE
    }),

    new ExtractTextPlugin({
      filename: PATHS.CSS
    }),

    // Build JSON file with field components
    new WebpackPreBuildPlugin(stats => {
      let components = fs.readdirSync(PATHS.COMPONENTS).filter(item => {
        return item.indexOf('Field') === 0
      })

      fs.writeFileSync(PATHS.FIELD_COMPONENT_LIST, JSON.stringify(components))
    }),

    // Process CSS Custom Properties and Custom Media
    new WebpackOnBuildPlugin(stats => {
      let fullCssPath = path.resolve(__dirname, PATHS.PUBLIC, PATHS.CSS)
      let css = fs.readFileSync(fullCssPath, 'utf8')
      let processedCss = postcss().use(postcssCustomProperties({
        preserve: true
      })).use(postcssCustomMedia()).process(css).css

      fs.writeFileSync(fullCssPath, processedCss)
    })
  ]).concat(ENV === 'production' ? [
    new UglifyJSPlugin({
      beautify: false,
      mangle: {
        screw_ie8: true,
        keep_fnames: true
      },
      compress: {
        screw_ie8: true,
        warnings: false
      },
      comments: false,
      minimize: true
    })
  ] : []),

  resolve: {
    alias: {
      lib: 'frontend/lib',
      containers: 'frontend/containers',
      components: 'frontend/components',
      middleware: 'frontend/middleware',
      views: 'frontend/views',
      actions: 'frontend/actions',
      reducers: 'frontend/reducers',
      'react': 'preact/aliases',
      'react-dom': 'preact/aliases',
      'react-router': 'preact-router',
      'react-redux': 'preact-redux',
      'fetch': 'unfetch/polyfill'
    },

    extensions: ['.jsx', '.js', '.json'],

    modules: [
      path.resolve(__dirname),
      path.resolve(__dirname, 'node_modules'),
      'node_modules'
    ]
  },

  stats: { colors: true }
}
