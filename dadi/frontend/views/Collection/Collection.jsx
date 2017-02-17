import { h, Component } from 'preact'
import { connect } from 'preact-redux'
import { bindActionCreators } from 'redux'
import { connectHelper } from 'lib/util'

import * as apiActions from 'actions/apiActions'

class Collection extends Component {
  render() {
    const { state, collection } = this.props

    if (!collection) {
      return (
        <h1>No Collection selected</h1>
      )
    }

    return (
      <h1>Current Collection is {collection}</h1>
    )    
  }
}

export default connectHelper(
  state => state.api,
  dispatch => bindActionCreators(apiActions, dispatch)
)(Collection)
