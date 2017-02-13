import { h, Component } from 'preact'
import { connect } from 'preact-redux'
import { bindActionCreators } from 'redux'
/*
* Libs
 */
import { connectHelper } from '../../lib/util'
import APIBridge from '../../lib/api-bridge-client'
/*
* Components
 */
import Main from '../../components/Main/Main'
import Nav from '../../components/Nav/Nav'
/*
* Actions
 */
import * as apiActions from '../../actions/apiActions'
import * as documentActions from '../../actions/documentActions'

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
        {state.document.docIsLoading ? (
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
  componentWillMount () {
    this.getDocument()
  }
  componentWillUnmount () {
    const { actions } = this.props
    actions.setDocument(true, null)
  }
  getDocument () {
    const { state, actions, collection, document_id } = this.props
    return APIBridge(state.api.apis[0])
    .in(collection)
    .whereFieldIsEqualTo('_id', document_id)
    .find()
    .then(doc => {
      actions.setDocument(false, doc.results[0])
    })
  }
}

export default connectHelper(
  state => state,
  dispatch => bindActionCreators({...documentActions, ...apiActions}, dispatch)
)(DocumentEdit)
