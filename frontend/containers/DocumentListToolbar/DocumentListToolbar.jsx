'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './DocumentListToolbar.css'

import * as Constants from 'lib/constants'
import * as appActions from 'actions/appActions'
import * as documentActions from 'actions/documentActions'
import * as documentsActions from 'actions/documentsActions'

import {bindActionCreators} from 'redux'
import {connectHelper} from 'lib/util'
import {Format} from 'lib/util/string'
import {route} from '@dadi/preact-router'

import Button from 'components/Button/Button'
import ButtonWithPrompt from 'components/ButtonWithPrompt/ButtonWithPrompt'
import Checkbox from 'components/Checkbox/Checkbox'
import Paginator from 'components/Paginator/Paginator'
import Toolbar from 'components/Toolbar/Toolbar'
import ToolbarTextInput from 'components/Toolbar/ToolbarTextInput'

/**
 * A toolbar used in a document list view.
 */
class DocumentListToolbar extends Component {
  static propTypes = {
    /**
     * The global actions object.
     */
    actions: proptypes.object,

    /**
     * The API to operate on.
     */
    api: proptypes.object,

    /**
     * The collection to operate on.
     */
    collection: proptypes.object,

    /**
     * The parent collection to operate on, when dealing with a reference field.
     */
    collectionParent: proptypes.object,

    /**
    * A callback to be used to obtain the base URL for the given page, as
    * determined by the view.
    */
    onBuildBaseUrl: proptypes.func,

    /**
    * A callback to be called when the user has chosen to delete a selection
    * of documents. An array of document IDs will be sent as a parameter.
    */
    onDelete: proptypes.func,

    /**
     * The name of a reference field currently being edited.
     */
    referencedField: proptypes.string,

    /**
     * The global state object.
     */
    state: proptypes.object
  }

  constructor(props) {
    super(props)

    this.BULK_ACTIONS_PLACEHOLDER = 'BULK_ACTIONS_PLACEHOLDER'
    this.state.bulkActionSelected = this.BULK_ACTIONS_PLACEHOLDER
  }

  componentDidUpdate(prevProps, prevState) {
    const {actions, state} = this.props
    const {isDeleting, list} = state.documents
    const wasDeleting = prevProps.state.documents.isDeleting

    // Have we just deleted some documents?
    if (wasDeleting && !isDeleting) {
      let message = wasDeleting > 1 ?
        `${wasDeleting} documents have been deleted` :
        'The document has been deleted'

      actions.setNotification({
        message
      })
    }
  }

  render() {
    const {
      onBuildBaseUrl,
      referencedField,
      state
    } = this.props
    const documentsList = state.documents.list

    if (!documentsList) return null

    const {metadata} = documentsList

    return (
      <Toolbar>      
        {metadata.totalCount > 1 && (
          <div class={styles.section}>
            <span class={styles['count-label']}>
              <span>Showing </span>
              <strong>{`${metadata.offset + 1}-${Math.min(metadata.offset + metadata.limit, metadata.totalCount)} `}</strong>
              of <strong>{metadata.totalCount}</strong>
            </span>
          </div>
        )}
        <div class={styles.section}>
          <Paginator
            currentPage={metadata.page}
            linkCallback={page => {
              let href = onBuildBaseUrl({
                createNew: referencedField && !state.router.parameters.documentId,
                page,
                referenceFieldSelect: referencedField
              })

              return href
            }}
            maxPages={8}
            totalPages={metadata.totalPages}
          />

          <div class={styles.information}>
            {metadata.totalCount > metadata.limit && (
              <span class={styles['page-input']}>
                <ToolbarTextInput
                  onChange={this.handleGoToPage.bind(this)}
                  size="small"
                  placeholder="Go to page"
                />
              </span>
            )} 
          </div>
        </div>

        <div class={styles.section}>
          {Boolean(referencedField)
            ? this.renderReferencedDocumentActions()
            : this.renderBulkActions()
          }
        </div>
      </Toolbar>
    )
  }

  renderBulkActions() {
    const {bulkActionSelected} = this.state
    const {state} = this.props
    const selectedDocuments = state.documents.selected
    const multiple = selectedDocuments.length > 1

    return (
      <div class={styles.actions}>
        <select
          class={styles.select}
          onChange={this.handleBulkActionSelect.bind(this)}
          value={bulkActionSelected}
        >
          <option disabled value={this.BULK_ACTIONS_PLACEHOLDER}>With selected...</option>
          <option value="delete">Delete</option>
        </select>

        <ButtonWithPrompt
          accent="data"
          className={styles['select-button']}
          disabled={(bulkActionSelected === this.BULK_ACTIONS_PLACEHOLDER) || !selectedDocuments.length}
          onClick={this.handleBulkActionApply.bind(this)}
          promptCallToAction={`Yes, delete ${multiple ? 'them' : 'it'}.`}
          promptMessage={`Are you sure you want to delete the selected ${multiple ? 'documents' : 'document'}?`}
          size="small"
        >Apply</ButtonWithPrompt>
      </div>
    )
  }

  renderReferencedDocumentActions() {
    const {state} = this.props
    const selectedDocuments = state.documents.selected
    const ctaText = selectedDocuments.length > 1 ?
      'Add selected documents' : 'Add selected document'

    return (
      <div class={styles.actions}>
        <Button
          accent="save"
          disabled={!selectedDocuments.length}
          onClick={this.handleReferencedDocumentSelect.bind(this)}
        >{ctaText}</Button>
      </div>
    )
  }

  handleBulkActionApply(actionType) {
    const {onDelete} = this.props
    const {bulkActionSelected} = this.state
    const validBulkActionSelected = bulkActionSelected &&
      (bulkActionSelected !== this.BULK_ACTIONS_PLACEHOLDER)

    if (!validBulkActionSelected) return

    const {
      actions,
      api,
      collection,
      group,
      state
    } = this.props

    if (bulkActionSelected === 'delete' && typeof onDelete === 'function') {
      onDelete(state.documents.selected)
    }
  }

  handleBulkActionSelect(event) {
    this.setState({
      bulkActionSelected: event.target.value
    })
  }

  handleGoToPage(event) {
    const {
      collection,
      group,
      onBuildBaseUrl,
      referencedField,
      state
    } = this.props
    const documentsList = state.documents.list
    const {metadata} = documentsList
    const inputValue = event.target.value
    const parsedValue = parseInt(inputValue)

    if (!documentsList) return null

    // If the input is not a valid positive integer number, we return.
    if ((parsedValue.toString() !== inputValue) || (parsedValue <= 0)) return

    // If the number inserted is outside the range of the pages available,
    // we return.
    if (parsedValue > metadata.totalPages) return

    let href = onBuildBaseUrl({
      createNew: referencedField && !state.router.parameters.documentId,
      page: parsedValue,
      referenceFieldSelect: referencedField
    })

    route(href)
  }

  handleReferencedDocumentSelect() {
    const {
      actions,
      collection,
      group,
      onBuildBaseUrl,
      parentDocumentId,
      referencedField,
      state
    } = this.props
    const documentsList = state.documents.list.results
    const {currentParentCollection} = state.api

    // We might want to change this when we allow a field to reference multiple
    // documents. For now, we just get the first selected document.
    const selectedDocuments = state.documents.selected.map(documentId => {
      return documentsList.find(document => {
        return document._id === documentId
      })
    }).filter(Boolean)

    actions.updateLocalDocument({
      [referencedField]: selectedDocuments
    }, {
      path: collection.path
    })

    let redirectUrl = onBuildBaseUrl({
      createNew: !Boolean(state.router.parameters.documentId)
    })

    route(redirectUrl)
  }
}

export default connectHelper(
  state => ({
    api: state.api,
    documents: state.documents,
    router: state.router
  }),
  dispatch => bindActionCreators({
    ...appActions,
    ...documentActions,
    ...documentsActions
  }, dispatch)
)(DocumentListToolbar)
