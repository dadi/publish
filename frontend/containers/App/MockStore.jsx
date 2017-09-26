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

export default class MockStore extends Component {
  render() {
    const store = compose(applyMiddleware(thunk))(createStore)(
      this.props.state ?
      () => this.props.state :
      enableBatching(reducer)
    )
    const history = syncRouteWithStore(browserHistory, store)

    return (
      <Provider store={store}>
        {this.props.children}
      </Provider>
    )
  }
}
