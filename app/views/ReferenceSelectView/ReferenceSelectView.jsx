import * as Constants from 'lib/constants'
import * as fieldComponents from 'lib/field-components'
import {getFieldType, getVisibleFields} from 'lib/fields'
import {ArrowBack} from '@material-ui/icons'
import {Button} from '@dadi/edit-ui'
import {connectRedux} from 'lib/redux'
import DocumentGridList from 'components/DocumentGridList/DocumentGridList'
import DocumentList from 'containers/DocumentList/DocumentList'
import DocumentListController from 'components/DocumentListController/DocumentListController'
import DocumentListToolbar from 'components/DocumentListToolbar/DocumentListToolbar'
import DocumentTableList from 'containers/DocumentTableList/DocumentTableList'
import HeroMessage from 'components/HeroMessage/HeroMessage'
import MediaGridCard from 'containers/MediaGridCard/MediaGridCard'
import React from 'react'
import styles from './ReferenceSelectView.css'

class ReferenceSelectView extends React.Component {
  constructor(props) {
    super(props)

    this.changePage = page => this.setState({page})
    this.clearFilters = () => this.setState({filter: undefined})
    this.handleEmptyDocumentList = this.handleEmptyDocumentList.bind(this)
    this.handleFiltersUpdate = this.handleFiltersUpdate.bind(this)
    this.handleSelectionUpdate = this.handleSelectionUpdate.bind(this)

    this.state = {
      filter: undefined,
      page: 1,
      sortBy: undefined,
      sortOrder: undefined,
      selection: props.initialSelection
    }
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

    // Are we showing only selected documents?
    const isFilteringSelection = filter && filter.$selected === true

    const showSelectedDocuments = () => {
      if (!isFilteringSelection)
        this.setState(({filter}) => ({
          filter: {...filter, $selected: true}
        }))
    }

    return (
      <div className={styles.container}>
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
          enableFilters={true}
          filters={filter}
          onUpdateFilters={this.handleFiltersUpdate}
          referenceFieldName={referenceFieldName}
        />

        <main>
          <DocumentList
            collection={referencedCollection}
            contentKey={contentKey}
            filters={{
              ...filter,
              ...referenceFilters
            }}
            onBuildBaseUrl={buildUrl}
            onEmptyList={this.handleEmptyDocumentList}
            onRender={({documents, onSelect, selectedDocuments}) => {
              return this.renderList({
                documents,
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
              filled
              data-name="save-reference-selection-button"
              onClick={() => onSave(selection)}
            >
              Save selection
            </Button>
          </DocumentListToolbar>
        </div>
      </div>
    )
  }

  renderList({documents, onSelect, referencedCollection, selectedDocuments}) {
    const {referenceFieldSchema} = this.props

    if (referencedCollection.IS_MEDIA_BUCKET) {
      return (
        <DocumentGridList
          documents={documents}
          onRenderCard={({item, isSelected, onSelect}) => (
            <MediaGridCard
              key={item._id}
              isSelected={isSelected}
              item={item}
              onSelect={onSelect}
            />
          )}
          onSelect={onSelect}
          selectedDocuments={selectedDocuments}
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

    const {sortBy, sortOrder} = this.state

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
        onSort={({sortBy, sortOrder}) => this.setState({sortBy, sortOrder})}
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
