import { h, Component } from 'preact'
import { connect } from 'preact-redux'
import { bindActionCreators } from 'redux'
/*
* Libs
 */
import { connectHelper } from 'lib/util'
import APIBridge from 'lib/api-bridge-client'
/*
* Components
 */
import Main from 'components/Main/Main'
import Nav from 'components/Nav/Nav'
/*
* Actions
 */
import * as apiActions from 'actions/apiActions'
import * as documentActions from 'actions/documentActions'

class DocumentEdit extends Component {
  constructor (props) {
    super(props)
  }
  render() {
    const { state, method, document } = this.props
    return (
      <Main>
        <Nav apis={ state.api.apis } />
        <h1>Method: { method }</h1>
        {!state.document.data ? (
          <h3>Status: {state.document.docIsLoading}</h3>
        ) : (
          <table border="1">
            <tr>
              {Object.keys(state.document.data).map(field => (
                <td>{field}</td>
              ))}
            </tr>
            <tr>
              {Object.keys(state.document.data).map(field => (
                <td>{state.document.data[field]}</td>
              ))}
            </tr>
          </table>
        )}
      </Main>
    )
  }
  componentDidUpdate (previousProps) {
    const { state, actions } = this.props
    const previousState = previousProps.state
    const { data, docIsLoading } = state.document
    const newStatePath = state.routing.locationBeforeTransitions.pathname
    const previousStatePath = previousState.routing.locationBeforeTransitions.pathname

    // State check: reject when missing config, session, or apis
    if (!state.app.config || !state.api.apis.length || !state.user.signedIn) return
    // State check: reject when path matches and document list loaded
    if (newStatePath === previousStatePath && data) return
    // State check: reject when documents are still loading
    if (docIsLoading) return

    this.getDocument()
  }

  componentWillUnmount () {
    const { actions } = this.props
    // Clear our documents and reset loading state
    actions.setDocument(true, null)
  }
  getDocument () {
    const { state, actions, collection, document_id } = this.props
    return APIBridge(state.api.apis[0])
    .in(collection)
    .whereFieldIsEqualTo('_id', document_id)
    .find()
    .then(doc => {
      actions.setDocument(false, doc.results[0] || {err: `No document with _id ${document_id}`})
    })
  }
}

export default connectHelper(
  state => state,
  dispatch => bindActionCreators({...documentActions, ...apiActions}, dispatch)
)(DocumentEdit)
