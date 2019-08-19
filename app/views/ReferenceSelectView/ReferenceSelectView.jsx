import * as Constants from 'lib/constants'
import * as fieldComponents from 'lib/field-components'
import {getFieldType, getVisibleFields} from 'lib/fields'
import Button from 'components/Button/Button'
import {connectRedux} from 'lib/redux'
import DocumentGridList from 'components/DocumentGridList/DocumentGridList'
import DocumentList from 'containers/DocumentList/DocumentList'
import DocumentListController from 'components/DocumentListController/DocumentListController'
import DocumentListToolbar from 'components/DocumentListToolbar/DocumentListToolbar'
import DocumentTableList from 'containers/DocumentTableList/DocumentTableList'
import HeroMessage from 'components/HeroMessage/HeroMessage'
import Main from 'components/Main/Main'
import MediaGridCard from 'containers/MediaGridCard/MediaGridCard'
import Page from 'components/Page/Page'
import React from 'react'
import ReferenceSelectHeader from 'components/ReferenceSelectHeader/ReferenceSelectHeader'
import styles from './ReferenceSelectView.css'

class ReferenceSelectView extends React.Component {
  constructor(props) {
    super(props)

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
          <Button
            accent="system"
            onClick={() => this.setState({filter: undefined})}
          >
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

    const {filter, page, sortBy, sortOrder} = this.state

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
      <Page>
        <ReferenceSelectHeader
          onCancel={this.props.onCancel}
          referenceField={referenceFieldSchema}
        />

        <DocumentListController
          collection={referencedCollection}
          enableFilters={true}
          filters={filter}
          onUpdateFilters={this.handleFiltersUpdate}
          referenceFieldName={referenceFieldName}
        />

        <Main>
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
            page={this.state.page}
            selection={this.state.selection}
            sort={sortBy}
          />
        </Main>

        <div className={styles.toolbar}>
          <DocumentListToolbar
            metadata={metadata}
            pageChangeHandler={() => page => this.setState({page})}
            selectedDocuments={this.state.selection}
            showSelectedDocuments={showSelectedDocuments}
          >
            <Button
              accent="save"
              data-name="save-reference-selection-button"
              onClick={() => this.props.onSave(this.state.selection)}
            >
              Save selection
            </Button>
          </DocumentListToolbar>
        </div>
      </Page>
    )
  }

  renderList({documents, onSelect, referencedCollection, selectedDocuments}) {
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
