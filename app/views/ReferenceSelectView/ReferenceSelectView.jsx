import * as Constants from 'lib/constants'
import * as documentActions from 'actions/documentActions'
import * as fieldComponents from 'lib/field-components'
import * as selectionActions from 'actions/selectionActions'
import {getFieldType, getVisibleFields} from 'lib/fields'
import Button from 'components/Button/Button'
import {connectRedux} from 'lib/redux'
import Document from 'containers/Document/Document'
import DocumentGridList from 'components/DocumentGridList/DocumentGridList'
import DocumentList from 'containers/DocumentList/DocumentList'
import DocumentListController from 'components/DocumentListController/DocumentListController'
import DocumentListToolbar from 'components/DocumentListToolbar/DocumentListToolbar'
import DocumentTableList from 'containers/DocumentTableList/DocumentTableList'
import ErrorMessage from 'components/ErrorMessage/ErrorMessage'
import Header from 'containers/Header/Header'
import HeroMessage from 'components/HeroMessage/HeroMessage'
import Main from 'components/Main/Main'
import MediaGridCard from 'containers/MediaGridCard/MediaGridCard'
import Page from 'components/Page/Page'
import React from 'react'
import {Redirect} from 'react-router-dom'
import ReferenceSelectHeader from 'components/ReferenceSelectHeader/ReferenceSelectHeader'
import {slugify} from 'shared/lib/string'
import styles from './ReferenceSelectView.css'

class ReferenceSelectView extends React.Component {
  constructor(props) {
    super(props)

    this.cancelSelection = this.cancelSelection.bind(this)
    this.saveSelection = this.saveSelection.bind(this)
    this.hasPropagatedInitialSelection = {}
  }

  cancelSelection() {
    const {actions, selectionKey} = this.props

    actions.setDocumentSelection({
      key: selectionKey,
      selection: []
    })

    this.goBackToDocument()
  }

  goBackToDocument() {
    const {
      history,
      isNewDocument,
      onBuildBaseUrl,
      referenceFieldSchema
    } = this.props

    // It's fair to assume that the user got here because they were editing
    // the value of the reference field in the edit view. As such, we must
    // take them back to whatever section the reference field belongs to, if
    // any.
    const fieldSection =
      referenceFieldSchema.publish &&
      referenceFieldSchema.publish.section &&
      slugify(referenceFieldSchema.publish.section)

    const redirectUrl = onBuildBaseUrl.call(this, {
      createNew: isNewDocument,
      referenceFieldSelect: null,
      search: {
        filter: null
      },
      section: fieldSection || null
    })

    history.push(redirectUrl)
  }

  saveSelection() {
    const {
      actions,
      parentContentKey,
      route,
      selection,
      selectionKey
    } = this.props
    const {referenceField} = route.params

    actions.updateLocalDocument({
      contentKey: parentContentKey,
      update: {
        [referenceField]: selection && selection.length > 0 ? selection : null
      },
      error: {
        [referenceField]: undefined
      }
    })

    actions.setDocumentSelection({
      key: selectionKey,
      selection: []
    })

    this.goBackToDocument()
  }

  handleEmptyDocumentList({selection}) {
    const {onBuildBaseUrl, route} = this.props
    const {filter} = route.search

    if (filter && Object.keys(filter).length > 0) {
      // If we are filtering by selection and there are no documents selected,
      // we might as well remove the filter instead of showing a "No documents
      // found" message.
      if (filter.$selected && selection.length === 0) {
        const redirectUrl = onBuildBaseUrl.call(this, {
          search: {
            ...route.search,
            filter: {
              ...filter,
              $selected: undefined
            }
          }
        })

        return <Redirect to={redirectUrl} />
      }

      return (
        <HeroMessage
          title="No documents found."
          subtitle="We can't find anything matching those filters."
        >
          <Button
            accent="system"
            href={onBuildBaseUrl.call(this, {
              search: {}
            })}
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

  handleFiltersUpdate(newFilters) {
    const {history, onBuildBaseUrl, route} = this.props
    const {documentId} = route.params
    const newFilterValue =
      Object.keys(newFilters).length > 0 ? newFilters : null
    const newUrl = onBuildBaseUrl.call(this, {
      createNew: Boolean(!documentId),
      search: {
        ...route.search,
        filter: newFilterValue
      }
    })

    history.push(newUrl)
  }

  handleSelectionChange(selection) {
    const {actions, selectionKey} = this.props

    actions.setDocumentSelection({
      key: selectionKey,
      selection
    })
  }

  propagateInitialSelection(selection) {
    const {actions, selectionKey} = this.props

    // Because this method is called multiple times, off the back of `render`,
    // we must ensure that we only set the initial selection once for each
    // selection key. We use this object to keep track of that.
    if (this.hasPropagatedInitialSelection[selectionKey]) {
      return
    }

    this.hasPropagatedInitialSelection[selectionKey] = true

    const sanitisedSelection = (Array.isArray(selection)
      ? selection
      : [selection]
    ).filter(item => item && item._id)

    if (sanitisedSelection.length > 0) {
      actions.setDocumentSelection({
        key: selectionKey,
        selection: sanitisedSelection
      })
    }
  }

  render() {
    const {
      collection,
      contentKey,
      isNewDocument,
      isSingleDocument,
      onBuildBaseUrl,
      parentContentKey,
      referenceFieldSchema,
      route,
      selection,
      state
    } = this.props
    const {documentId, page, referenceField: referenceFieldName} = route.params
    const {search} = route
    const parsedPage = Number.parseInt(page)
    const pageNumber = parsedPage.toString() === page ? parsedPage : undefined

    if (!isNewDocument && !isSingleDocument && !documentId) {
      // This is not a valid route.
      return (
        <Page>
          <Header />

          <Main>
            <ErrorMessage type={Constants.ERROR_ROUTE_NOT_FOUND} />
          </Main>
        </Page>
      )
    }

    // If the `collection` parameter doesn't match a valid collection,
    // we render nothing.
    if (!collection) {
      return null
    }

    if (!referenceFieldSchema) {
      return null
    }

    // Getting the component for the given reference field.
    const fieldType = getFieldType(referenceFieldSchema)
    const fieldComponent = fieldComponents[`Field${fieldType}`]

    // If the field component does not declare a `onReferenceSelect` method, it
    // means it's not meant to handle references.
    if (
      !fieldComponent ||
      typeof fieldComponent.onReferenceSelect !== 'function'
    ) {
      return null
    }

    // If the `referenceField` parameter doesn't match a field of type
    // `Reference`, we render nothing.
    if (
      !referenceFieldSchema ||
      (referenceFieldSchema.type !== 'Media' &&
        referenceFieldSchema.type !== 'Reference')
    ) {
      return null
    }

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
      filters = {}
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

    // Getting documents from store.
    const {metadata} = state.documents[contentKey] || {}

    // Are we showing only selected documents?
    const isFilteringSelection =
      search.filter && search.filter.$selected === true

    // Computing URL for the "show only selected documents" button.
    const showSelectedDocumentsUrl = !isFilteringSelection
      ? onBuildBaseUrl.call(this, {
          search: {
            ...search,
            filter: {
              ...search.filter,
              $selected: true
            }
          }
        })
      : undefined

    const renderPageContents = documentId => (
      <Document
        collection={collection}
        contentKey={parentContentKey}
        documentId={documentId}
        onRender={({document}) => {
          this.propagateInitialSelection(document._merged[referenceFieldName])

          return (
            <Page>
              <ReferenceSelectHeader
                onCancel={this.cancelSelection}
                referenceField={referenceFieldSchema}
              />

              <DocumentListController
                collection={referencedCollection}
                enableFilters={true}
                filters={search.filter}
                onUpdateFilters={this.handleFiltersUpdate.bind(this)}
                referenceFieldName={referenceFieldName}
              />

              <Main>
                <DocumentList
                  collection={referencedCollection}
                  contentKey={contentKey}
                  filters={{
                    ...search.filter,
                    ...filters
                  }}
                  onBuildBaseUrl={onBuildBaseUrl.bind(this)}
                  onEmptyList={this.handleEmptyDocumentList.bind(this)}
                  onRender={({documents, onSelect, selectedDocuments}) => {
                    return this.renderList({
                      documents,
                      onSelect,
                      referencedCollection,
                      search,
                      selectedDocuments
                    })
                  }}
                  onSelect={this.handleSelectionChange.bind(this)}
                  order={search.order}
                  page={pageNumber}
                  selection={selection}
                  sort={search.sort}
                />
              </Main>

              <div className={styles.toolbar}>
                <DocumentListToolbar
                  metadata={metadata}
                  pageChangeHandler={page =>
                    onBuildBaseUrl.call(this, {
                      createNew: !documentId,
                      page,
                      referenceFieldSelect: referenceFieldName
                    })
                  }
                  selectedDocuments={selection}
                  showSelectedDocumentsUrl={showSelectedDocumentsUrl}
                >
                  <Button accent="save" onClick={this.saveSelection}>
                    Save selection
                  </Button>
                </DocumentListToolbar>
              </div>
            </Page>
          )
        }}
      />
    )

    if (isSingleDocument) {
      // In this case the documentId is not in the URL, so we have to fetch the
      // document list and grab the _id from the fetched document.
      return (
        <DocumentList
          collection={collection}
          contentKey={JSON.stringify({collection: collection.slug})}
          onEmptyList={() => renderPageContents()}
          onRender={({documents}) => renderPageContents(documents[0]._id)}
        />
      )
    }

    return renderPageContents(documentId)
  }

  renderList({
    documents,
    onSelect,
    referencedCollection,
    search,
    selectedDocuments
  }) {
    const {onBuildBaseUrl} = this.props

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

    return (
      <DocumentTableList
        collection={referencedCollection}
        buildSortUrl={onBuildBaseUrl.bind(this)}
        documents={documents}
        fields={visibleFields}
        onBuildBaseUrl={params =>
          onBuildBaseUrl.call(this, {
            ...params,
            collection,
            group,
            referenceFieldSelect: null
          })
        }
        onSelect={onSelect}
        order={search.order}
        selectedDocuments={selectedDocuments}
        sort={search.sort}
      />
    )
  }
}

function mapState(state, ownProps) {
  const {
    route: {params, path, searchString}
  } = ownProps

  const collection =
    params.collection === Constants.MEDIA_COLLECTION_SCHEMA.slug
      ? Constants.MEDIA_COLLECTION_SCHEMA
      : state.app.config.api.collections.find(collection => {
          return collection.slug === params.collection
        })

  const referenceFieldSchema = collection.fields[params.referenceField]

  const isNewDocument = /\/new(\/|$)/.test(path) && !params.documentId
  const isSingleDocument =
    collection.settings &&
    collection.settings.publish &&
    collection.settings.publish.isSingleDocument

  const {group, page = '1', referenceField} = params

  const {slug} = collection
  const contentKey = JSON.stringify({
    collection: slug,
    group,
    page,
    referenceField,
    searchString
  })
  const parentContentKey = JSON.stringify({
    collection: slug,
    documentId: params.documentId
  })
  const selectionKey = JSON.stringify({
    collection: slug,
    referenceField
  })

  const selection = state.selection[selectionKey] || []

  return {
    collection,
    contentKey,
    isNewDocument,
    isSingleDocument,
    parentContentKey,
    referenceFieldSchema,
    selection,
    selectionKey,
    state
  }
}

export default connectRedux(mapState, documentActions, selectionActions)(
  ReferenceSelectView
)
