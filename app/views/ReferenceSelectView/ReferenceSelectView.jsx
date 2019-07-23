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
import DocumentTableList from 'components/DocumentTableList/DocumentTableList'
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

    this.hasPropagatedInitialSelection = {}
  }

  getContentKey() {
    const {route} = this.props
    const {collection, group, page = '1', referenceField} = route.params
    const {searchString} = route

    return JSON.stringify({
      collection,
      group,
      page,
      referenceField,
      searchString
    })
  }

  getParentContentKey() {
    const {route} = this.props
    const {collection, documentId} = route.params

    return JSON.stringify({
      collection,
      documentId
    })
  }

  getSelectionKey() {
    const {route} = this.props
    const {collection, referenceField} = route.params

    return JSON.stringify({
      collection,
      referenceField
    })
  }

  handleDocumentSelect({referenceField: schema, selection}) {
    const {actions, history, onBuildBaseUrl, route} = this.props
    const {documentId, referenceField} = route.params

    actions.updateLocalDocument({
      contentKey: this.getParentContentKey(),
      update: {
        [referenceField]: selection && selection.length > 0 ? selection : null
      },
      error: {
        [referenceField]: undefined
      }
    })

    // It's fair to assume that the user got here because they were editing
    // the value of the reference field in the edit view. As such, we must
    // take them back to whatever section the reference field belongs to, if
    // any.
    const fieldSection =
      schema.publish &&
      schema.publish.section &&
      slugify(schema.publish.section)
    const redirectUrl = onBuildBaseUrl.call(this, {
      createNew: !documentId,
      referenceFieldSelect: null,
      search: {
        filter: null
      },
      section: fieldSection || null
    })

    history.push(redirectUrl)
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
    const {actions} = this.props

    actions.setDocumentSelection({
      key: this.getSelectionKey(),
      selection
    })
  }

  propagateInitialSelection(selection) {
    const {actions} = this.props
    const selectionKey = this.getSelectionKey()

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
    const {onBuildBaseUrl, route, state} = this.props
    const {api} = state.app.config
    const {
      collection: collectionName,
      documentId,
      page,
      referenceField: referenceFieldName
    } = route.params
    const {search} = route
    const parsedPage = Number.parseInt(page)
    const pageNumber = parsedPage.toString() === page ? parsedPage : undefined

    // Getting the schema for the parent collection.
    const collection =
      collectionName === Constants.MEDIA_COLLECTION_SCHEMA.slug
        ? Constants.MEDIA_COLLECTION_SCHEMA
        : api.collections.find(collection => {
            return collection.slug === route.params.collection
          })

    // If the `collection` parameter doesn't match a valid collection,
    // we render nothing.
    if (!collection) {
      return null
    }

    // Getting the schema of the reference field.
    const referenceField = collection.fields[referenceFieldName]

    if (!referenceField) {
      return null
    }

    // Getting the component for the given reference field.
    const fieldType = getFieldType(referenceField)
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
      !referenceField ||
      (referenceField.type !== 'Media' && referenceField.type !== 'Reference')
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
    const contentKey = this.getContentKey()
    const data = state.documents[contentKey] || {}
    const {metadata} = data

    // Getting the IDs of the selected documents.
    const selectionKey = this.getSelectionKey()
    const selection = state.selection[selectionKey] || []

    // Computing the URL that users will be taken to if they wish to cancel
    // the reference selection.
    const returnCtaUrl = onBuildBaseUrl.call(this, {
      createNew: !documentId,
      referenceFieldSelect: null
    })

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

    return (
      <Document
        collection={collection}
        contentKey={this.getParentContentKey()}
        documentId={documentId}
        onRender={({document}) => {
          this.propagateInitialSelection(document._merged[referenceFieldName])

          return (
            <Page>
              <ReferenceSelectHeader
                referenceField={referenceField}
                returnCtaUrl={returnCtaUrl}
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
                  <Button
                    accent="save"
                    onClick={this.handleDocumentSelect.bind(this, {
                      referenceField,
                      selection
                    })}
                  >
                    Save selection
                  </Button>
                </DocumentListToolbar>
              </div>
            </Page>
          )
        }}
      />
    )
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

export default connectRedux(documentActions, selectionActions)(
  ReferenceSelectView
)
