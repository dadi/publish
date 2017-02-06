import { h, Component } from 'preact'
import { connect } from 'preact-redux'
import { bindActionCreators } from 'redux'
import { connectHelper } from '../../lib/util'

import * as apiActions from '../../actions/apiActions'

import Nav from '../../components/Nav/Nav'

// const localApiBridge = require('./../../lib/local-api-bridge-client')

class Api extends Component {

  componentDidMount() {
    const { state, actions } = this.props
    return this.getApis(state).then(apis => {
      actions.setApiList(apis)
    })
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
          </li>
        ))}
        {api ? (
          <h1>Current API is {api}</h1>
        ) : (
          <h1>No API selected</h1>
        )}
      </main>
    )
  }
  getApis (state) {
  //   return localApiBridge()
  //   .in('apis')
  //   .whereFieldExists('database')
  //   .find({extractResults: true})
  }
}

export default connectHelper(
  state => state.api,
  dispatch => bindActionCreators(apiActions, dispatch)
)(Api)
