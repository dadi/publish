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
import {buildUrl} from 'lib/router'
import {connectHelper} from 'lib/util'
import {Format} from 'lib/util/string'
import {getApiForUrlParams, getCollectionForUrlParams} from 'lib/collection-lookup'
import {route} from 'preact-router-regex'

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
     * The name of the collection being used.
     */
    collection: proptypes.string,

    /**
     * The name of the group where the current collection belongs (if any).
     */
    group: proptypes.string,

    /**
    * A callback to be used to obtain the base URL for the given page, as
    * determined by the view.
    */
    onBuildBaseUrl: proptypes.func,

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
    const {list, status} = state.documents
    const isIdle = status === Constants.STATUS_IDLE
    const previousStatus = prevProps.state.documents.status

    // Have we just deleted a single document?
    if (isIdle && (previousStatus === Constants.STATUS_DELETING_SINGLE)) {
      actions.setNotification({
        message: 'The document has been deleted'
      })
    }

    // Have we just deleted multiple documents?
    if (isIdle && (previousStatus === Constants.STATUS_DELETING_MULTIPLE)) {
      actions.setNotification({
        message: 'The documents have been deleted'
      })
    }
  }

  render() {
    const {
      collection,
      group,
      onBuildBaseUrl,
      referencedField,
      state
    } = this.props
    const documentsList = state.documents.list

    if (!documentsList) return null

    const {metadata} = documentsList

    return (
      <Toolbar>
        <div class={styles.section}>
          <div class={styles.information}>
            {metadata.totalCount > metadata.limit && (
              <ToolbarTextInput
                className={styles['page-input']}
                onChange={this.handleGoToPage.bind(this)}
                size="small"
                placeholder="Go to page"
              />
            )}
            {metadata.totalCount > 1 && (
              <span class={styles['count-label']}>
                <span>Showing </span>
                <strong>{`${metadata.offset + 1}-${Math.min(metadata.offset + metadata.limit, metadata.totalCount)} `}</strong>
                of <strong>{metadata.totalCount}</strong>
              </span>
            )}   
          </div>
        </div>

        <div class={styles.section}>
          <Paginator
            currentPage={metadata.page}
            linkCallback={this.handleBuildPageUrl.bind(this)}
            maxPages={8}
            totalPages={metadata.totalPages}
          />
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
          promptCallToAction="Yes, delete them."
          promptMessage="Are you sure you want to delete the selected documents?"
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

  handleBuildPageUrl(page) {
    const {
      onBuildBaseUrl,
      referencedField
    } = this.props

    if (referencedField) {
      return buildUrl(...onBuildBaseUrl(), 'select', referencedField, page)
    }

    return buildUrl(...onBuildBaseUrl(), page)
  }

  handleBulkActionApply(actionType) {
    const {bulkActionSelected} = this.state
    const validBulkActionSelected = bulkActionSelected &&
      (bulkActionSelected !== this.BULK_ACTIONS_PLACEHOLDER)

    if (!validBulkActionSelected) return

    const {
      actions,
      collection,
      group,
      state
    } = this.props
    const currentApi = getApiForUrlParams(state.api.apis, {
      collection,
      group
    })
    const currentCollection = getCollectionForUrlParams(state.api.apis, {
      collection,
      group,
      useApi: currentApi
    })

    if (bulkActionSelected === 'delete') {
      actions.deleteDocuments({
        api: currentApi,
        collection: currentCollection,
        ids: state.documents.selected
      })
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

    route(this.handleBuildPageUrl(parsedValue))
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
      collection,
      group
    })

    const parentCollection = getCollectionForUrlParams(state.api.apis, {
      collection,
      group
    })
    const referenceFieldSchema = parentCollection.fields[referencedField]
    const referenceFieldSection = referenceFieldSchema &&
      referenceFieldSchema.publish &&
      referenceFieldSchema.publish.section &&
      Format.slugify(referenceFieldSchema.publish.section)

    route(buildUrl(...onBuildBaseUrl({section: referenceFieldSection})))
  }
}

export default connectHelper(
  state => ({
    api: state.api,
    documents: state.documents
  }),
  dispatch => bindActionCreators({
    ...appActions,
    ...documentActions,
    ...documentsActions
  }, dispatch)
)(DocumentListToolbar)
