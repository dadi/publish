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
        {this.document.err ? (
          <h3>{this.document.err}</h3>
        ) : (
          <table border="1">
            <tr>
              {Object.keys(this.document).map(field => (
                <td>{field}</td>
              ))}
            </tr>
            <tr>
              {Object.keys(this.document).map(field => (
                <td>{this.document[field]}</td>
              ))}
            </tr>
          </table>
        )}
      </Main>
    )
  }
  componentWillMount () {
    const { state, document } = this.props
    this.document = document
  }
  get document () {
    return this._document || {err: "No document with this ID"}
  }
  set document (id) {
    const { state, actions, collection } = this.props
    return APIBridge(state.api.apis[0])
    .in(collection)
    .whereFieldIsEqualTo('_id', id)
    .find()
    .then(doc => {
      this._document = doc.results[0]
      actions.setDocument(this._document)
    })
  }
}

export default connectHelper(
  state => state,
  dispatch => bindActionCreators({...documentActions, ...apiActions}, dispatch)
)(DocumentEdit)
