import * as appActions from 'actions/appActions'
import * as Constants from 'lib/constants'
import * as documentActions from 'actions/documentActions'
import * as selectionActions from 'actions/selectionActions'
import BulkActionSelector from 'components/BulkActionSelector/BulkActionSelector'
import Button from 'components/Button/Button'
import {connectRedux} from 'lib/redux'
import DocumentEditView from 'views/DocumentEditView/DocumentEditView'
import DocumentGridList from 'components/DocumentGridList/DocumentGridList'
import DocumentList from 'containers/DocumentList/DocumentList'
import DocumentListController from 'components/DocumentListController/DocumentListController'
import DocumentListToolbar from 'components/DocumentListToolbar/DocumentListToolbar'
import DocumentTableList from 'containers/DocumentTableList/DocumentTableList'
import ErrorMessage from 'components/ErrorMessage/ErrorMessage'
import {getVisibleFields} from 'lib/fields'
import Header from 'containers/Header/Header'
import HeroMessage from 'components/HeroMessage/HeroMessage'
import Main from 'components/Main/Main'
import MediaGridCard from 'containers/MediaGridCard/MediaGridCard'
import MediaListController from 'components/MediaListController/MediaListController'
import Page from 'components/Page/Page'
import React from 'react'
import {Redirect} from 'react-router-dom'
import {setPageTitle} from 'lib/util'
import SpinningWheel from 'components/SpinningWheel/SpinningWheel'
import styles from './DocumentListView.css'

const BULK_ACTIONS = {
  DELETE: 'BULK_ACTIONS_DELETE'
}

class DocumentListView extends React.Component {
  componentDidUpdate(oldProps) {
    const {actions, contentKey, state} = this.props
    const data = state.documents[contentKey] || {}
    const oldData = oldProps.state.documents[contentKey] || {}
    const {isDeleting, error} = data
    const {isDeleting: wasDeleting} = oldData

    // Have we just deleted some documents?
    if (wasDeleting && !isDeleting) {
      const message = error
        ? `The document${wasDeleting > 1 ? 's' : ''} couldn't be deleted`
        : wasDeleting > 1
        ? `${wasDeleting} documents have been deleted`
        : 'The document has been deleted'

      actions.setNotification({
        message
      })
    }
  }

  handleBulkActionApply(collection, actionType) {
    const {actions, contentKey, selectionKey, state} = this.props
    const selection = state.selection[selectionKey] || []

    switch (actionType) {
      case BULK_ACTIONS.DELETE:
        if (selection.length > 0) {
          const ids = selection.map(({_id}) => _id).filter(Boolean)

          actions.deleteDocuments({
            collection,
            contentKey,
            ids
          })

          actions.setDocumentSelection({
            key: selectionKey,
            selection: []
          })
        }

        break

      default:
        return
    }
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

    // We display a slightly different message for the media library, since
    // there's no route for creating a new document.
    if (route.params.collection === Constants.MEDIA_COLLECTION_SCHEMA.slug) {
      return (
        <HeroMessage
          title="No media yet."
          subtitle="Once you upload media files, they will appear here."
        />
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
        >
          Create new document
        </Button>
      </HeroMessage>
    )
  }

  handleNetworkError() {
    const {actions, contentKey} = this.props

    return (
      <ErrorMessage
        data={{
          onClick: () => actions.touchDocumentList({contentKey})
        }}
        type={Constants.STATUS_FAILED}
      />
    )
  }

  handleFiltersUpdate(newFilters) {
    const {onBuildBaseUrl, route} = this.props
    const newFilterValue =
      Object.keys(newFilters).length > 0 ? newFilters : null
    const newUrl = onBuildBaseUrl.call(this, {
      search: {
        ...route.search,
        filter: newFilterValue
      }
    })

    route.history.push(newUrl)
  }

  handleMediaUpload(files) {
    const {actions, contentKey} = this.props

    actions.uploadMediaDocuments({
      contentKey,
      files: Array.from(files)
    })
  }

  handleSelect(selection) {
    const {actions, selectionKey} = this.props

    actions.setDocumentSelection({
      key: selectionKey,
      selection
    })
  }

  handleSort({sortBy, sortOrder}) {
    const {onBuildBaseUrl, route} = this.props
    const newUrl = onBuildBaseUrl.call(this, {
      search: {
        ...route.search,
        sort: sortBy,
        order: sortOrder
      }
    })

    route.history.push(newUrl)
  }

  render() {
    const {
      collection,
      contentKey,
      isSingleDocument,
      onBuildBaseUrl,
      route: {history, search},
      selectionKey,
      state
    } = this.props

    if (!collection) {
      return (
        <Page>
          <Header />

          <Main>
            <ErrorMessage type={Constants.ERROR_ROUTE_NOT_FOUND} />
          </Main>
        </Page>
      )
    }

    if (isSingleDocument) {
      return (
        <DocumentList
          collection={collection}
          contentKey={contentKey}
          onEmptyList={() => (
            <DocumentEditView {...this.props} isSingleDocument />
          )}
          onLoading={() => (
            <Page>
              <Header />

              <Main>
                <SpinningWheel />
              </Main>
            </Page>
          )}
          onNetworkError={this.handleNetworkError.bind(this)}
          onRender={({documents}) => (
            <DocumentEditView
              {...this.props}
              documentId={documents[0]._id}
              isSingleDocument
            />
          )}
        />
      )
    }

    // Getting documents from store.
    const data = state.documents[contentKey] || {}
    const {metadata} = data
    const {page, totalPages} = metadata || {}

    // If the page parameter is higher than the number of pages available for
    // the current document set, we redirect to the last valid page.
    if (totalPages > 0 && page > totalPages) {
      const redirectUrl = onBuildBaseUrl.call(this, {
        search: {...search, page: metadata.totalPages}
      })

      return <Redirect to={redirectUrl} />
    }

    // Getting the IDs of the selected documents.
    const selection = state.selection[selectionKey] || []

    // Computing bulk action options.
    const actions = {
      [BULK_ACTIONS.DELETE]: {
        confirmationMessage: `Are you sure you want to delete the selected ${
          selection.length > 1 ? 'documents' : 'document'
        }?`,
        ctaMessage: `Yes, delete ${selection.length > 1 ? 'them' : 'it'}.`,
        disabled: !selection.length,
        label: `Delete ${selection.length ? ' (' + selection.length + ')' : ''}`
      }
    }

    // Are we showing only selected documents?
    const isFilteringSelection =
      search.filter && search.filter.$selected === true

    // Computing URL for the "show only selected documents" button.
    const showSelectedDocumentsUrl = onBuildBaseUrl.call(this, {
      search: {
        ...search,
        filter: {
          ...search.filter,
          $selected: true
        }
      }
    })

    const showSelectedDocuments = () => {
      if (!isFilteringSelection) history.push(showSelectedDocumentsUrl)
    }

    // Setting the page title.
    setPageTitle(collection.name)

    // If we're on a media collection, we don't want to render a "Create new"
    // button.
    const createNewHref = collection.IS_MEDIA_BUCKET
      ? undefined
      : onBuildBaseUrl.call(this, {
          createNew: true,
          search: null
        })

    return (
      <Page>
        <Header />

        <DocumentListController
          collection={collection}
          createNewHref={createNewHref}
          enableFilters={true}
          filters={search.filter}
          onUpdateFilters={this.handleFiltersUpdate.bind(this)}
        />

        <Main>
          <div className={styles['list-container']}>
            {this.renderMain({
              collection,
              contentKey,
              isFilteringSelection,
              selection
            })}
          </div>
        </Main>

        <div className={styles.toolbar}>
          <DocumentListToolbar
            metadata={metadata}
            pageChangeHandler={page =>
              onBuildBaseUrl.call(this, {search: {...search, page}})
            }
            selectedDocuments={selection}
            showSelectedDocuments={showSelectedDocuments}
          >
            <BulkActionSelector
              actions={actions}
              onChange={this.handleBulkActionApply.bind(this, collection)}
              selection={selection}
            />
          </DocumentListToolbar>
        </div>
      </Page>
    )
  }

  renderMain({collection, contentKey, isFilteringSelection, selection}) {
    const {onBuildBaseUrl, route} = this.props
    const {search} = route
    const pageNumber = search.page

    if (collection.IS_MEDIA_BUCKET) {
      return (
        <>
          {!isFilteringSelection && (
            <MediaListController onUpload={this.handleMediaUpload.bind(this)} />
          )}

          <DocumentList
            collection={Constants.MEDIA_COLLECTION_SCHEMA}
            contentKey={contentKey}
            filters={search.filter}
            onEmptyList={this.handleEmptyDocumentList.bind(this)}
            onNetworkError={this.handleNetworkError.bind(this)}
            onRender={({documents, onSelect, selectedDocuments}) => (
              <DocumentGridList
                documents={documents}
                onRenderCard={({item, isSelected, onSelect}) => (
                  <MediaGridCard
                    href={`/media/${item._id}`}
                    key={item._id}
                    isSelected={isSelected}
                    item={item}
                    onSelect={onSelect}
                  />
                )}
                onSelect={onSelect}
                selectedDocuments={selectedDocuments}
              />
            )}
            onSelect={this.handleSelect.bind(this)}
            order={search.order}
            page={pageNumber}
            selectAllHotKey="mod+a"
            selection={selection}
            sort={search.sort}
          />
        </>
      )
    }

    // Filtering visible fields.
    const visibleFields =
      collection &&
      Object.keys(
        getVisibleFields({
          fields: collection.fields,
          viewType: 'list'
        })
      ).concat(Constants.DEFAULT_FIELDS)

    return (
      <DocumentList
        collection={collection}
        contentKey={contentKey}
        fields={visibleFields}
        filters={search.filter}
        onEmptyList={this.handleEmptyDocumentList.bind(this)}
        onNetworkError={this.handleNetworkError.bind(this)}
        onRender={({documents, onSelect, selectedDocuments}) => (
          <DocumentTableList
            collection={collection}
            documents={documents}
            fields={visibleFields}
            onBuildBaseUrl={onBuildBaseUrl.bind(this)}
            onSelect={onSelect}
            onSort={this.handleSort.bind(this)}
            order={search.order}
            selectedDocuments={selectedDocuments}
            sort={search.sort}
            title={collection.name}
          />
        )}
        onSelect={this.handleSelect.bind(this)}
        order={search.order}
        page={pageNumber}
        selection={selection}
        sort={search.sort}
      />
    )
  }
}

function mapState(state, ownProps) {
  const {
    route: {params, search, searchString}
  } = ownProps

  const collection =
    params.collection === Constants.MEDIA_COLLECTION_SCHEMA.slug
      ? Constants.MEDIA_COLLECTION_SCHEMA
      : state.app.config.api.collections.find(collection => {
          return collection.slug === params.collection
        })

  const isSingleDocument =
    collection.settings &&
    collection.settings.publish &&
    collection.settings.publish.isSingleDocument

  const {group} = params
  const contentKey = isSingleDocument
    ? JSON.stringify({collection: collection.slug})
    : JSON.stringify({
        collection: collection.slug,
        group,
        page: search.page || 1,
        searchString
      })
  const selectionKey = JSON.stringify({collection: collection.slug, group})

  return {
    collection,
    contentKey,
    isSingleDocument,
    selectionKey,
    state
  }
}

export default connectRedux(
  mapState,
  appActions,
  documentActions,
  selectionActions
)(DocumentListView)
