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
        {state.document.listIsLoading ? (
          <h3>Loader based on: {state.document.listIsLoading}</h3>
        ) : (
          <table border="1">
            {state.document.list.results.map(document => (
              <tr>
                <td><a href={ `/${this.props.collection}/document/edit/${document._id}` }>Edit</a></td>
                {Object.keys(document).map(field => (
                  <td>{document[field]}</td>
                ))}
              </tr>
            ))}
          </table>
        )}
        {Array(state.document.list.metadata.totalPages).fill().map((_, page) => (
          <a href={ `/${this.props.collection}/documents/${page+1}` }>{page+1}</a>
        ))}
      </Main>
    )
  }
  shouldComponentUpdate(nextProps, nextState) {
    const { state, actions, page, collection } = this.props
    if (nextProps.page && nextProps.page !== page) {
      // Set loading state to true, retaining current documents to avoid reflow
      actions.setDocumentList(true, state.document.list)
      this.getDocumentList(nextProps.page)
    } else if (nextProps.collection && nextProps.collection !== collection) {
      // Set loading state to true, retaining current documents to avoid reflow
      actions.setDocumentList(true, state.document.list)
      this.getDocumentList(nextProps.page, nextProps.collection)
    }
  }
  componentWillMount () {
    this.getDocumentList()
  }
  componentWillUnmount () {
    const { actions } = this.props
    actions.setDocumentList(true, null)
  }
  getDocumentList (nextPage, nextCollection) {
    const { state, actions, collection, page } = this.props
    if (!state.api.apis.length > 0) return
    return APIBridge(state.api.apis[0])
    .in(nextCollection || collection)
    .limitTo(20) // Config based on collection schema
    .goToPage(nextPage || page)
    .sortBy('createdAt', 'desc') // Configure based on user preferences
    .find()
    .then(docs => {
      actions.setDocumentList(false, docs)
    }).catch((err) => {
      // TODO: Graceful deal with failure
    })
  }
}

export default connectHelper(
  state => state,
  dispatch => bindActionCreators({...documentActions, ...apiActions}, dispatch)
)(DocumentList)
