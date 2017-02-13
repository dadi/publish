import { h, Component } from 'preact'
import { connect } from 'preact-redux'
import { bindActionCreators } from 'redux'
import { connectHelper } from '../../lib/util'
/*
* Components
 */
import Nav from '../../components/Nav/Nav'
/*
* Actions
 */
import * as apiActions from '../../actions/apiActions'

class Collection extends Component {
  render() {
    const { state, collection } = this.props
    return (
      <main>
        <Nav apis={ state.apis } />
        {collection ? (
          <h1>Current Collection is {collection}</h1>
        ) : (
          <h1>No Collection selected</h1>
        )}
      </main>
    )
  }
}

export default connectHelper(
  state => state.api,
  dispatch => bindActionCreators(apiActions, dispatch)
)(Collection)
