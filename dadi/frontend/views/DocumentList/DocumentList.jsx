import { h, Component } from 'preact'
import { connect } from 'preact-redux'
import { bindActionCreators } from 'redux'

/*
* Actions
 */
import * as apiActions from '../../actions/apiActions'
import * as documentActions from '../../actions/documentActions'
/*
* Components
 */
import Main from '../../components/Main/Main'
import Nav from '../../components/Nav/Nav'
/*
* Libs
 */
import { connectHelper } from '../../lib/util'
import APIBridge from '../../lib/api-bridge-client'

class DocumentList extends Component {
  constructor (props) {
    super(props)
  }
  render() {
    const { state } = this.props
    return (
      <Main>
        <Nav apis={ state.api.apis } />
        <table border="1">
          {state.document.documents.results.map(document => (
            <tr>
              <td><a href={ `/${this.props.collection}/document/edit/${document._id}` }>Edit</a></td>
              {Object.keys(document).map(field => (
                <td>{document[field]}</td>
              ))}
            </tr>
          ))}
        </table>
        {Array(state.document.documents.metadata.totalPages).fill().map((_, page) => (
          <a href={ `/${this.props.collection}/documents/${page+1}` }>{page+1}</a>
        ))}
      </Main>
    )
  }
  shouldComponentUpdate(nextProps, nextState) {
    const { state } = this.props
    if (nextProps.page && nextProps.page !== this.props.page) {
      this.getDocumentList(nextProps.page)
    }
  }
  componentWillMount () {
    const { page } = this.props
    this.getDocumentList(page || 1)
  }
  getDocumentList (page) {
    const { state, actions, collection } = this.props
    if (!state.api.apis.length > 0) return
    return APIBridge(state.api.apis[0])
    .in(collection)
    .limitTo(20) // Config based on collection schema
    .goToPage(page)
    .sortBy('createdAt', 'desc') // Configure based on user preferences
    .find()
    .then(docs => {
      actions.setDocumentList(docs)
    }).catch((err) => {
      // TODO: Graceful deal with failure
    })
  }
}

export default connectHelper(
  state => state,
  dispatch => bindActionCreators({...documentActions, ...apiActions}, dispatch)
)(DocumentList)
