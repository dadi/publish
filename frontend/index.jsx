'use strict'

import * as reducers from 'reducers'
import {h, render} from 'preact'
import {Provider} from 'preact-redux'
import {
  applyMiddleware,
  combineReducers,
  compose,
  createStore
} from 'redux'
import {enableBatching} from 'lib/redux'
import App from 'containers/App/App'
import createHistory from 'history/createBrowserHistory'
import PluginManager from '../frontend/lib/plugin-manager'
import syncRouteWithStore from 'middleware/router'
import thunk from 'redux-thunk'

const browserHistory = createHistory()
const reducer = combineReducers(reducers)
const storeComposer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const store = storeComposer(applyMiddleware(thunk))(createStore)(enableBatching(reducer))
const history = syncRouteWithStore(browserHistory, store)

window.Publish = new PluginManager()

render((
  <Provider store={store}>
    <App history={history} />
  </Provider>
), document.body)
