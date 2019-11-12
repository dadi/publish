import * as Constants from 'lib/constants'
import * as fieldComponents from 'lib/field-components'
import {getFieldType, getVisibleFields} from 'lib/fields'
import {ArrowBack} from '@material-ui/icons'
import {Button} from '@dadi/edit-ui'
import {connectRedux} from 'lib/redux'
import DocumentList from 'containers/DocumentList/DocumentList'
import DocumentListController from 'components/DocumentListController/DocumentListController'
import DocumentListToolbar from 'components/DocumentListToolbar/DocumentListToolbar'
import DocumentTableList from 'containers/DocumentTableList/DocumentTableList'
import HeroMessage from 'components/HeroMessage/HeroMessage'
import MediaList from 'components/MediaList/MediaList'
import React from 'react'
import Style from 'lib/Style'
import styles from './ReferenceSelectView.css'

class ReferenceSelectView extends React.Component {
  constructor(props) {
    super(props)

    this.changePage = page => this.setState({page})
    this.clearFilters = () => this.setState({filter: undefined})
    this.handleEmptyDocumentList = this.handleEmptyDocumentList.bind(this)
    this.handleFiltersUpdate = this.handleFiltersUpdate.bind(this)
    this.handleSelectionUpdate = this.handleSelectionUpdate.bind(this)
    this.sortList = ({sortBy, sortOrder}) => this.setState({sortBy, sortOrder})
    this.updateMediaListMode = mediaListMode => this.setState({mediaListMode})

    this.state = {
      filter: undefined,
      mediaListMode: 'grid',
      page: 1,
      sortBy: undefined,
      sortOrder: undefined,
      selection: props.initialSelection
    }
  }

  static defaultProps = {
    saveText: 'Save selection'
  }

  handleEmptyDocumentList() {
    const {filter} = this.state

    if (filter && Object.keys(filter).length > 0) {
      return (
        <HeroMessage
          title="No documents found."
          subtitle="We can't find anything matching those filters."
        >
          <Button accent="positive" onClick={this.clearFilters}>
            Clear filters
          </Button>
        </HeroMessage>
      )
    }

    return (
      <HeroMessage
        title="No documents yet."
        subtitle="Once created, they will appear here."
      />
    )
  }

  handleFiltersUpdate(filter) {
    this.setState({filter: Object.keys(filter).length ? filter : undefined})
  }

  handleSelectionUpdate(selection) {
    const {filter} = this.state

    if (filter && filter.$selected && !selection.length) {
      // If we are filtering by selection and there are no documents selected,
      // we might as well remove the filter instead of showing a "No documents
      // found" message.
      this.setState(({filter}) => ({
        filter: {...filter, $selected: false},
        selection
      }))
    } else {
      this.setState({selection})
    }
  }

  render() {
    const {
      buildUrl,
      collection,
      onCancel,
      onSave,
      referenceFieldName,
      referenceFieldSchema,
      saveText,
      state
    } = this.props

    // Getting the component for the given reference field.
    const fieldType = getFieldType(referenceFieldSchema)
    const fieldComponent = fieldComponents[`Field${fieldType}`]

    // Using the component's `onReferenceSelect` method to find the schema of
    // the referenced collection. This method is expected to return an object
    // with the following properties:
    //
    // - collection: the schema of the referenced collection;
    // - filters (optional): a set of filters to apply to the collection when
    //   fetching documents
    const {api} = state.app.config
    const {
      collection: referencedCollection,
      filters: referenceFilters = {}
    } = fieldComponent.onReferenceSelect({
      api,
      collection,
      field: referenceFieldName
    })

    // If we don't have a referenced collection at this point, we render
    // nothing.
    if (!referencedCollection) {
      return null
    }

    const {filter, page, selection, sortBy, sortOrder} = this.state

    const contentKey = JSON.stringify({
      collection: collection.slug,
      referenceFieldName,
      search: {filter, page, sortBy, sortOrder}
    })

    // Getting documents from store.
    const {metadata} = state.documents[contentKey] || {}
    const hasDocuments = metadata && metadata.totalCount > 0

    // Are we showing only selected documents?
    const isFilteringSelection = filter && filter.$selected === true

    const showSelectedDocuments = () => {
      if (!isFilteringSelection)
        this.setState(({filter}) => ({
          filter: {...filter, $selected: true}
        }))
    }

    const mainStyle = new Style(styles, 'main').addIf(
      'is-media',
      referencedCollection.IS_MEDIA_BUCKET
    )

    return (
      <>
        <div className={styles.header}>
          <Button
            accent="negative"
            className={styles['back-button']}
            flat
            onClick={onCancel}
          >
            <ArrowBack />
            <span>Cancel</span>
          </Button>
        </div>

        <DocumentListController
          collection={referencedCollection}
          enableFilters
          filters={filter}
          onUpdateFilters={this.handleFiltersUpdate}
        />

        <main className={mainStyle.getClasses()}>
          <DocumentList
            collection={referencedCollection}
            contentKey={contentKey}
            filters={{
              ...filter,
              ...referenceFilters
            }}
            onBuildBaseUrl={buildUrl}
            onEmptyList={this.handleEmptyDocumentList}
            onRender={({
              documents,
              hasSelection,
              onSelect,
              selectedDocuments
            }) => {
              return this.renderList({
                documents,
                hasSelection,
                isFilteringSelection,
                onSelect,
                referencedCollection,
                selectedDocuments
              })
            }}
            onSelect={this.handleSelectionUpdate}
            order={sortOrder}
            page={page}
            selection={selection}
            sort={sortBy}
          />
        </main>

        <div className={styles.toolbar}>
          <DocumentListToolbar
            metadata={metadata}
            onPageChange={this.changePage}
            selectedDocuments={selection}
            showSelectedDocuments={showSelectedDocuments}
          >
            <Button
              accent="positive"
              disabled={!hasDocuments}
              fillStyle="filled"
              data-name="save-reference-selection-button"
              onClick={() => onSave(selection)}
            >
              {saveText}
            </Button>
          </DocumentListToolbar>
        </div>
      </>
    )
  }

  renderList({
    documents,
    hasSelection,
    isFilteringSelection,
    onSelect,
    referencedCollection,
    selectedDocuments
  }) {
    const {buildUrl, referenceFieldSchema} = this.props
    const {mediaListMode, sortBy, sortOrder} = this.state

    if (referencedCollection.IS_MEDIA_BUCKET) {
      return (
        <MediaList
          documents={documents}
          hasSelection={hasSelection}
          isFilteringSelection={isFilteringSelection}
          mode={mediaListMode}
          onBuildBaseUrl={buildUrl}
          onListModeUpdate={this.updateMediaListMode}
          onSelect={onSelect}
          onSort={this.sortList}
          order={sortOrder}
          selectedDocuments={selectedDocuments}
          sort={sortBy}
        />
      )
    }

    // Filtering visible fields.
    const visibleFields = Object.keys(
      getVisibleFields({
        fields: referencedCollection.fields,
        viewType: 'list'
      })
    ).concat(Constants.DEFAULT_FIELDS)

    const {
      _publishCollection: collection,
      _publishGroup: group
    } = referencedCollection

    return (
      <DocumentTableList
        collection={referencedCollection}
        documents={documents}
        fields={visibleFields}
        onBuildBaseUrl={params =>
          this.props.buildUrl({
            ...params,
            collection,
            group
          })
        }
        onSelect={onSelect}
        onSort={this.sortList}
        order={sortOrder}
        selectedDocuments={selectedDocuments}
        sort={sortBy}
        title={referenceFieldSchema.label}
        subtitle="Select documents to reference"
      />
    )
  }
}

function mapState(state, ownProps) {
  const {collection, referenceFieldName} = ownProps

  return {
    referenceFieldSchema: collection.fields[referenceFieldName],
    state
  }
}

export default connectRedux(mapState)(ReferenceSelectView)
