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

const storeComposer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const store = storeComposer(applyMiddleware(thunk))(createStore)(() => {
  return {
    app: {
      api: () => {}
    }
  }
})

export default class MockStore extends Component {
  render() {
    return (
      <Provider store={store}>
        {this.props.children}
      </Provider>
    )
  }
}
