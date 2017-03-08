import {h, Component} from 'preact'
import {connect} from 'preact-redux'
import {bindActionCreators} from 'redux'

import Style from 'lib/Style'
import styles from './DocumentEdit.css'

import {connectHelper} from 'lib/util'
import * as Constants from 'lib/constants'
import APIBridge from 'lib/api-bridge-client'

import Main from 'components/Main/Main'
import Nav from 'components/Nav/Nav'

import FieldImage from 'components/FieldImage/FieldImage'

import * as apiActions from 'actions/apiActions'
import * as documentActions from 'actions/documentActions'

class DocumentEdit extends Component {
  constructor(props) {
    super(props)
  }
  
  render() {
    const {collection, documentId, method, state} = this.props
    const document = state.document

    if (document.status === Constants.STATUS_LOADING) {
      return (
        <p>Loading...</p>
      )
    }

    return (
      <section class={styles.content}>
        <div class={styles.main}>
          <p>Main</p>
        </div>
        <div class={styles.sidebar}>
          <p>Side bar</p>
        </div>
      </section>
    )
  }

  componentDidUpdate(previousProps) {
    const {documentId, state} = this.props
    const document = state.document
    const documentIdHasChanged = documentId !== previousProps.documentId

    // If we haven't already started fetching a document and there isn't a document already in
    // the store or we need to get a new one because the id has changed, let's get a document
    if ((document.status !== Constants.STATUS_LOADING) && (!document.data || documentIdHasChanged)) {
      this.getDocument(documentId)
    }
  }

  componentWillUnmount() {
    const {actions} = this.props

    // Clear our documents and reset loading state
    actions.setDocument(null)
  }

  getDocument(documentId) {
    const {actions, collection, state} = this.props

    actions.setDocumentStatus(Constants.STATUS_LOADING)
    
    return APIBridge(state.api.apis[0])
      .in(collection)
      .whereFieldIsEqualTo('_id', documentId)
      .find()
      .then(doc => {
        actions.setDocument(doc.results[0], collection)
      })
  }

  groupFields(fields) {
    let main = []
    let sidebar = []

    fields.forEach(field => {

    })
  }
}

export default connectHelper(
  state => state,
  dispatch => bindActionCreators({...documentActions, ...apiActions}, dispatch)
)(DocumentEdit)
