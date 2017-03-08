'use strict'
import {h, render} from 'preact'
import {Provider} from 'preact-redux'
import {createStore, applyMiddleware, combineReducers} from 'redux'
import createHistory from 'history/createBrowserHistory'
import {syncHistoryWithStore} from 'preact-router-redux'

import * as reducers from 'reducers'
import * as types from 'actions/actionTypes'

import App from 'containers/App/App'

const browserHistory = createHistory()

const reducer = combineReducers(reducers)
const store = createStore(reducer)

const history = syncHistoryWithStore(browserHistory, store)

render ((
  <Provider store={store}>
    <App history={history}/>
  </Provider>
), document.body)