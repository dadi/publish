import { h, Component } from 'preact'
import { connect } from 'preact-redux'
import { bindActionCreators } from 'redux'
import { connectHelper } from '../../lib/util'

import Nav from '../../components/Nav/Nav'

class DocumentEdit extends Component {
  render() {
    const { method, document } = this.props

    return (
      <main>
        <Nav />
        <h1>Document Edit: { method }</h1>
        {document ? (
          <h1>Current Document is { document }</h1>
        ) : (
          <h1>No Document selected</h1>
        )}
      </main>
    )
  }
}

export default connectHelper(
  state => state,
  dispatch => bindActionCreators({}, dispatch)
)(DocumentEdit)
