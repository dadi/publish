import { h, Component } from 'preact'
import { connect } from 'preact-redux'
import { bindActionCreators } from 'redux'
import { connectHelper } from '../../lib/util'

import Nav from '../../components/Nav/Nav'

class Error extends Component {
  render() {
    const { type } = this.props
    return (
      <main>
        <Nav />
          <h1>Error: { type }</h1>
      </main>
    )
  }
}

export default connectHelper(
  state => state,
  dispatch => bindActionCreators({}, dispatch)
)(Error)
