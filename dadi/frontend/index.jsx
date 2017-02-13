import { h, render } from 'preact'
import { Provider } from 'preact-redux'
import { createStore, applyMiddleware, combineReducers } from 'redux'
import thunk from 'redux-thunk'

import * as reducers from './reducers'
import * as types from './actions/actionTypes'

import App from './containers/App/App'

const createStoreWithMiddleware = applyMiddleware(thunk)(createStore)
const reducer = combineReducers(reducers)
const store = createStoreWithMiddleware(reducer)

render ((
  <Provider store={store}>
    <App/>
  </Provider>
), document.body)
