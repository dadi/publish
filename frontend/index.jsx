'use strict'
import {h, render} from 'preact'
import {Provider} from 'preact-redux'
import {createStore, combineReducers} from 'redux'
import createHistory from 'history/createBrowserHistory'
import syncRouteWithStore from 'middleware/router'

import * as reducers from 'reducers'

import App from 'containers/App/App'

const browserHistory = createHistory()
const reducer = combineReducers(reducers)
const store = createStore(reducer)
const history = syncRouteWithStore(browserHistory, store)

render ((
  <Provider store={store}>
    <App history={history}/>
  </Provider>
), document.body)