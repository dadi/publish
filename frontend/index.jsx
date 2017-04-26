'use strict'

import {h, render} from 'preact'
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
import Socket from 'lib/socket'
import syncRouteWithStore from 'middleware/router'

import * as reducers from 'reducers'

import App from 'containers/App/App'

const browserHistory = createHistory()
const reducer = combineReducers(reducers)
const store = compose(applyMiddleware(thunk))(createStore)(enableBatching(reducer))
const history = syncRouteWithStore(browserHistory, store)

render((
  <Provider store={store}>
    <App history={history} />
  </Provider>
), document.body)
