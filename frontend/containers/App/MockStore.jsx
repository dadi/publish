import {h, Component} from 'preact'
import proptypes from 'proptypes'
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

import * as reducers from 'reducers/'

const browserHistory = createHistory()
const reducer = combineReducers(reducers)
const store = compose(applyMiddleware(thunk))(createStore)(enableBatching(reducer))
const history = syncRouteWithStore(browserHistory, store)

export default class MockStore extends Component {
  render() {
    return (
      <Provider store={store}>
        {this.props.children}
      </Provider>
    )
  }
}
