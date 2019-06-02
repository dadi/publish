import * as appActions from 'actions/appActions'
import * as Constants from 'lib/constants'
import * as documentActions from 'actions/documentActions'
import * as selectionActions from 'actions/selectionActions'
import {connectRedux} from 'lib/redux'
import {getVisibleFields} from 'lib/fields'
import {Redirect} from 'react-router-dom'
import {setPageTitle} from 'lib/util'
import Button from 'components/Button/Button'
import BulkActionSelector from 'components/BulkActionSelector/BulkActionSelector'
import DocumentList from 'containers/DocumentList/DocumentList'
import DocumentListController from 'components/DocumentListController/DocumentListController'
import DocumentListToolbar from 'components/DocumentListToolbar/DocumentListToolbar'
import ErrorMessage from 'components/ErrorMessage/ErrorMessage'
import Header from 'containers/Header/Header'
import HeroMessage from 'components/HeroMessage/HeroMessage'
import Main from 'components/Main/Main'
import MediaListController from 'components/MediaListController/MediaListController'
import Page from 'components/Page/Page'
import React from 'react'

const BULK_ACTIONS = {
  DELETE: 'BULK_ACTIONS_DELETE'
}

class DocumentListView extends React.Component {
  componentDidUpdate(oldProps) {
    const {actions, state} = this.props
    const data = state.documents[this.getContentKey()] || {}
    const oldData = oldProps.state.documents[this.getContentKey()] || {}
    const {isDeleting} = data
    const {isDeleting: wasDeleting} = oldData

    // Have we just deleted some documents?
    if (wasDeleting && !isDeleting) {
      const message = wasDeleting > 1 ?
        `${wasDeleting} documents have been deleted` :
        'The document has been deleted'

      actions.setNotification({
        message
      })
    }
  }

  getContentKey() {
    const {route} = this.props
    const {
      collection,
      group,
      page = '1'
    } = route.params
    const {searchString} = route

    return JSON.stringify({collection, group, page, searchString})
  }

  getSelectionKey() {
    const {route} = this.props
    const {collection, group} = route.params

    return JSON.stringify({collection, group})
  }

  handleBulkActionApply(collection, actionType) {
    const {actions, state} = this.props
    const selection = state.selection[this.getSelectionKey()] || []

    switch (actionType) {
      case BULK_ACTIONS.DELETE:
        if (selection.length > 0) {
          const ids = selection.map(({_id}) => _id).filter(Boolean)

          actions.deleteDocuments({
            collection,
            contentKey: this.getContentKey(),
            ids
          })

          actions.setDocumentSelection({
            key: this.getSelectionKey(),
            selection: []
          })
        }

        break

      default:
        return
    }
  }

  handleEmptyDocumentList({selection}) {
    const {
      onBuildBaseUrl,
      route
    } = this.props
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

        return (
          <Redirect to={redirectUrl}/>
        )
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
          >Clear filters</Button>
        </HeroMessage>
      )
    }

    return (
      <HeroMessage
        title="No documents yet."
        subtitle="Once created, they will appear here."
      >
        <Button
          accent="save"
          href={onBuildBaseUrl.call(this, {
            createNew: true
          })}
        >Create new document</Button>
      </HeroMessage>
    )    
  }

  handleFiltersUpdate(newFilters) {
    const {history, onBuildBaseUrl, route} = this.props
    const newFilterValue = Object.keys(newFilters).length > 0
      ? newFilters
      : null
    const newUrl = onBuildBaseUrl.call(this, {
      search: {
        ...route.search,
        filter: newFilterValue
      }
    })

    history.push(newUrl)
  }

  handleMediaUpload(files) {
    const {actions} = this.props

    actions.uploadMediaDocuments({
      contentKey: this.getContentKey(),
      files: Array.from(files)
    })    
  }

  handleSelect(selection) {
    const {actions} = this.props

    actions.setDocumentSelection({
      key: this.getSelectionKey(),
      selection
    })
  }

  render() {
    const {
      onBuildBaseUrl,
      route,
      state
    } = this.props
    const {api} = state.app.config
    const {collection: collectionName} = route.params
    const {search} = route
    const collection = collectionName === Constants.MEDIA_COLLECTION_SCHEMA.slug
      ? Constants.MEDIA_COLLECTION_SCHEMA
      : api.collections.find(collection => {
          return collection.slug === route.params.collection
        })

    if (!collection) {
      return (
        <Page>
          <Header />

          <Main>
            <ErrorMessage type={Constants.ERROR_ROUTE_NOT_FOUND}/>
          </Main>
        </Page>
      )
    }

    // Getting documents from store.
    const contentKey = this.getContentKey()
    const data = state.documents[contentKey] || {}
    const {metadata, results, dirty} = data
    const {page, totalPages} = metadata || {}
    const isSingleton = Boolean(collection.settings.publish && collection.settings.publish.singleton)
    if (isSingleton && !dirty && results && results.length > 0) {
      const redirectUrl = onBuildBaseUrl.call(this, {
        documentId: results[0]._id
      })

      return (
        <Redirect to={redirectUrl}/>
      )
    }

    // If the page parameter is higher than the number of pages available for
    // the current document set, we redirect to the last valid page.
    if (totalPages > 0 && page > totalPages) {
      const redirectUrl = onBuildBaseUrl.call(this, {
        page: metadata.totalPages
      })

      return (
        <Redirect to={redirectUrl}/>
      )
    }

    // Getting the IDs of the selected documents.
    const selectionKey = this.getSelectionKey()
    const selection = state.selection[selectionKey] || []

    // Computing bulk action options.
    const actions = {
      [BULK_ACTIONS.DELETE]: {
        confirmationMessage: 
          `Are you sure you want to delete the selected ${selection.length > 1 ?
            'documents' :
            'document'}?`,
        ctaMessage: `Yes, delete ${selection.length > 1 ? 'them' : 'it'}.`,
        disabled: !selection.length,
        label: `Delete ${selection.length ? ' (' + selection.length + ')' : ''}`
      }
    }

    // Are we showing only selected documents?
    const isFilteringSelection = search.filter &&
      search.filter.$selected === true

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

    setPageTitle(collection.name)

    return (
      <Page>
        <Header currentCllection={collection}>
          {this.renderController({collection}, !isSingleton)}
        </Header>

        <Main>
          {this.renderMain({
            collection,
            contentKey,
            isFilteringSelection,
            selection
          })}
        </Main>

        { !isSingleton && (
          <DocumentListToolbar
            documentsMetadata={data.metadata}
            onBuildPageUrl={page => onBuildBaseUrl.call(this, {
              page
            })}
            selectedDocuments={selection}
            showSelectedDocumentsUrl={showSelectedDocumentsUrl}
          >
            <BulkActionSelector
              actions={actions}
              onChange={this.handleBulkActionApply.bind(this, collection)}
              selection={selection}
            />
          </DocumentListToolbar>
        ) }
      </Page>
    )
  }

  renderController({collection}, showFilters) {
    const {onBuildBaseUrl, route} = this.props
    const {search} = route

    // If we're on a media collection, we don't want to render a "Create new"
    // button.
    const createNewHref = collection.IS_MEDIA_BUCKET
      ? undefined
      : onBuildBaseUrl.call(this, {
          createNew: true,
          search: null
        })

    return (
      <DocumentListController
        collection={collection}
        createNewHref={createNewHref}
        enableFilters={showFilters}
        filters={search.filter}
        onUpdateFilters={this.handleFiltersUpdate.bind(this)}
      />
    )
  }

  renderMain({collection, contentKey, isFilteringSelection, selection}) {
    const {onBuildBaseUrl, route} = this.props
    const {page} = route.params
    const {search} = route
    const parsedPage = Number.parseInt(page)
    const pageNumber = parsedPage.toString() === page
      ? parsedPage
      : undefined

    if (collection.IS_MEDIA_BUCKET) {
      return (
        <>
          {!isFilteringSelection && (
            <MediaListController
              onUpload={this.handleMediaUpload.bind(this)}
            />            
          )}
  
          <DocumentList
            collection={Constants.MEDIA_COLLECTION_SCHEMA}
            contentKey={contentKey}
            filters={search.filter}
            listType="grid"
            onBuildBaseUrl={onBuildBaseUrl}
            onEmptyList={this.handleEmptyDocumentList.bind(this)}
            onSelect={this.handleSelect.bind(this)}
            order={search.order}
            page={pageNumber}
            selection={selection}
            sort={search.sort}
          />
        </>
      )
    }

    // Filtering visible fields.
    const visibleFields = collection && Object.keys(
      getVisibleFields({
        fields: collection.fields,
        viewType: 'list'
      })
    ).concat(Constants.DEFAULT_FIELDS)

    return (
      <DocumentList
        collection={collection}
        contentKey={this.getContentKey()}
        fields={visibleFields}
        filters={search.filter}
        onBuildBaseUrl={onBuildBaseUrl.bind(this)}
        onEmptyList={this.handleEmptyDocumentList.bind(this)}
        onSelect={this.handleSelect.bind(this)}
        order={search.order}
        page={pageNumber}
        selection={selection}
        sort={search.sort}
      />      
    )
  }
}

export default connectRedux(
  appActions,
  documentActions,
  selectionActions
)(DocumentListView)
