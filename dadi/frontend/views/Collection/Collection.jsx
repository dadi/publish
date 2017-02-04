import { h, Component } from 'preact'
import { connect } from 'preact-redux'
import { bindActionCreators } from 'redux'
import { connectHelper } from '../../lib/util'

import Nav from '../../components/Nav/Nav'

class Collection extends Component {
  render() {
    const { collection } = this.props
    return (
      <main>
        <Nav />
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
  state => state,
  dispatch => bindActionCreators({}, dispatch)
)(Collection)
