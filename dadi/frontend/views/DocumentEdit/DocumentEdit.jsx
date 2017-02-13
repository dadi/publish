import { h, Component } from 'preact'
import { connect } from 'preact-redux'
import { bindActionCreators } from 'redux'
import { connectHelper } from '../../lib/util'
/*
* Components
 */
import Main from '../../components/Main/Main'
import Nav from '../../components/Nav/Nav'
/*
* Actions
 */
import * as apiActions from '../../actions/apiActions'

class DocumentEdit extends Component {
  render() {
    const { state, method, document } = this.props
    return (
      <Main>
        <Nav apis={ state.apis } />
        <h1>Document Edit: { method }</h1>
        {document ? (
          <h1>Current Document is { document }</h1>
        ) : (
          <h1>No Document selected</h1>
        )}
      </Main>
    )
  }
}

export default connectHelper(
  state => state.api,
  dispatch => bindActionCreators(apiActions, dispatch)
)(DocumentEdit)
