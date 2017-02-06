import { h, Component } from 'preact'
import { connect } from 'preact-redux'
import { bindActionCreators } from 'redux'
import { connectHelper } from '../../lib/util'
import * as _ from 'underscore'

import * as apiActions from '../../actions/apiActions'

import Nav from '../../components/Nav/Nav'

const APIBridge = require('./../../lib/api-bridge-client')

class Api extends Component {

  constructor () {
    super()
    this.getApiCollections.bind(this)
  }

  componentDidMount() {
    this.getApiCollections()
  }

  render({ api }, { authenticate }) {
    const { state } = this.props
    return (
      <main>
        <Nav />
        {state.apis.map(api => (
          <li>
            <h3>{api.database}</h3>
            <p>host: {api.host}</p>
            {api.collections ? (
              <div>
                <h3>Collections</h3>
                <ul>
                  {api.collections.map(collection => (
                    <li>
                      <h3>{collection.name}</h3>
                      <p>Path: {collection.path}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p>No collections</p>
            )}
          </li>
        ))}
        {api ? (
          <h1>Current API is {api}</h1>
        ) : (
          <h3>No API selected</h3>
        )}
      </main>
    )
  }
  getApiCollections () {
    const { state, actions } = this.props
    let queue = _.map(state.apis, (api, key) => {
      if (api.collections) return
      return APIBridge(api)
      .useDatabase(api.database)
      .getCollections()
      .then(collections => {
        _.extend(state.apis[key], JSON.parse(collections))
        actions.setApiList(state.apis)
        return out
      }).catch((err) => {
        return err
      })
    })
    return Promise.all(queue)
  }
}

export default connectHelper(
  state => state.api,
  dispatch => bindActionCreators(apiActions, dispatch)
)(Api)