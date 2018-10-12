'use strict'

import {h, render} from 'preact'
import 'preact/debug'
import {Provider} from 'preact-redux'
import {
  applyMiddleware,
  combineReducers,
  compose,
  createStore
} from 'redux'
import thunk from 'redux-thunk'
import {enableBatching} from 'lib/redux'
import createHistory from 'history/createBrowserHistory'
import syncRouteWithStore from 'middleware/router'

import * as reducers from 'reducers'

import App from 'containers/App/App'

const browserHistory = createHistory()
const reducer = combineReducers(reducers)
const storeComposer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const store = storeComposer(applyMiddleware(thunk))(createStore)(enableBatching(reducer))
const history = syncRouteWithStore(browserHistory, store)

render((
  <Provider store={store}>
    <App history={history} />
  </Provider>
), document.body)
