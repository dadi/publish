import * as appActions from 'actions/appActions'
import * as Constants from 'lib/constants'
import * as documentActions from 'actions/documentActions'
import * as selectionActions from 'actions/selectionActions'
import {buildUrl} from 'lib/util/url'
import {Button} from '@dadi/edit-ui'
import {connectRedux} from 'lib/redux'
import DocumentEditView from 'views/DocumentEditView/DocumentEditView'
import DocumentList from 'containers/DocumentList/DocumentList'
import DocumentListController from 'components/DocumentListController/DocumentListController'
import DocumentListToolbar from 'components/DocumentListToolbar/DocumentListToolbar'
import DocumentTableList from 'containers/DocumentTableList/DocumentTableList'
import DropArea from 'components/DropArea/DropArea'
import ErrorMessage from 'components/ErrorMessage/ErrorMessage'
import FileUpload from 'components/FileUpload/FileUpload'
import {getVisibleFields} from 'lib/fields'
import Header from 'containers/Header/Header'
import HeroMessage from 'components/HeroMessage/HeroMessage'
import {Link} from 'react-router-dom'
import MediaList from 'components/MediaList/MediaList'
import Modal from 'components/Modal/Modal'
import NotificationCentre from 'containers/NotificationCentre/NotificationCentre'
import Prompt from 'components/Prompt/Prompt'
import React from 'react'
import {Redirect} from 'react-router-dom'
import {setPageTitle} from 'lib/util'
import SpinningWheel from 'components/SpinningWheel/SpinningWheel'
import styles from './DocumentListView.css'

const MainWithHeader = ({children}) => (
  <>
    <Header />
    <main className={styles.main}>{children}</main>
  </>
)

class DocumentListView extends React.Component {
  constructor(props) {
    super(props)

    this.buildBaseUrl = buildUrl.bind(this)
    this.deleteSelected = this.deleteSelected.bind(this)
    this.handleEmptyDocumentList = this.handleEmptyDocumentList.bind(this)
    this.handleFiltersUpdate = this.handleFiltersUpdate.bind(this)
    this.handleMediaUpload = this.handleMediaUpload.bind(this)
    this.handleNetworkError = this.handleNetworkError.bind(this)
    this.handlePageChange = this.handlePageChange.bind(this)
    this.handleSelect = this.handleSelect.bind(this)
    this.handleSort = this.handleSort.bind(this)

    this.showDeletePrompt = () => this.setState({isShowingDeletePrompt: true})
    this.hideDeletePrompt = () => this.setState({isShowingDeletePrompt: false})

    this.state = {
      isShowingDeletePrompt: false
    }
  }

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
        message,
        type: error ? 'negative' : 'positive'
      })
    }
  }

  deleteSelected() {
    const {
      actions,
      collection,
      contentKey,
      selection,
      selectionKey
    } = this.props

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

    this.hideDeletePrompt()
  }

  handleEmptyDocumentList({selection}) {
    const {route} = this.props
    const {filter} = route.search

    if (filter && Object.keys(filter).length > 0) {
      // If we are filtering by selection and there are no documents selected,
      // we might as well remove the filter instead of showing a "No documents
      // found" message.
      if (filter.$selected && selection.length === 0) {
        const redirectUrl = this.buildBaseUrl({
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
          subtitle="We can't find anything matching the filters applied."
        />
      )
    }

    // We display a slightly different message for the media library, since
    // there's no route for creating a new document.
    if (route.params.collection === Constants.MEDIA_COLLECTION_SCHEMA.slug) {
      return (
        <DropArea
          className={styles['empty-view-droparea']}
          onDrop={this.handleMediaUpload}
        >
          <HeroMessage
            title="No media yet"
            subtitle="To start adding files, drag and drop them here or use the button below."
          >
            <FileUpload multiple={true} onChange={this.handleMediaUpload}>
              <Button accent="positive" fillStyle="filled">
                Select files
              </Button>
            </FileUpload>
          </HeroMessage>
        </DropArea>
      )
    }

    const createNewHref = this.buildBaseUrl({createNew: true})

    return (
      <HeroMessage
        title="No documents yet"
        subtitle="Once created, they will appear here."
      >
        <Link to={createNewHref}>
          <Button accent="positive" fillStyle="filled">
            Create new document
          </Button>
        </Link>
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
    const {route} = this.props
    const newFilterValue =
      Object.keys(newFilters).length > 0 ? newFilters : null
    const newUrl = this.buildBaseUrl({
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

  handlePageChange(page) {
    const {route} = this.props
    const {history, search} = route

    history.push(this.buildBaseUrl({search: {...search, page}}))
  }

  handleSelect(selection) {
    const {actions, selectionKey} = this.props

    actions.setDocumentSelection({
      key: selectionKey,
      selection
    })
  }

  handleSort({sortBy, sortOrder}) {
    const {route} = this.props
    const {history, search} = route
    const newSearch = {
      ...search,
      sort: undefined,
      order: undefined
    }

    if (sortBy) {
      newSearch.sort = sortBy
      newSearch.order = sortOrder
    }

    history.push(this.buildBaseUrl({search: newSearch}))
  }

  render() {
    const {
      collection,
      contentKey,
      isSingleDocument,
      route,
      selection,
      state
    } = this.props
    const {search} = route

    if (!collection) {
      return (
        <MainWithHeader>
          <ErrorMessage type={Constants.ERROR_ROUTE_NOT_FOUND} />
        </MainWithHeader>
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
            <MainWithHeader>
              <SpinningWheel />
            </MainWithHeader>
          )}
          onNetworkError={this.handleNetworkError}
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
    const {page, totalCount, totalPages} = metadata || {}
    const hasDocuments = totalCount > 0

    // If the page parameter is higher than the number of pages available for
    // the current document set, we redirect to the last valid page.
    if (totalPages > 0 && page > totalPages) {
      const redirectUrl = this.buildBaseUrl({
        search: {...search, page: metadata.totalPages}
      })

      return <Redirect to={redirectUrl} />
    }

    // Setting the page title.
    setPageTitle(collection.name)

    // If we're on a media collection, we don't want to render a "Create new"
    // button.
    const createNewHref = collection.IS_MEDIA_BUCKET
      ? undefined
      : this.buildBaseUrl({createNew: true, search: null})

    return (
      <>
        {this.state.isShowingDeletePrompt && (
          <Modal onRequestClose={this.hideDeletePrompt}>
            <Prompt
              accent="negative"
              action={`Yes, delete ${selection.length === 1 ? 'it' : 'them'}`}
              onCancel={this.hideDeletePrompt}
              onConfirm={this.deleteSelected}
            >
              Are you sure you want to delete the selected{' '}
              {selection.length === 1 ? 'document' : 'documents'}?
            </Prompt>
          </Modal>
        )}

        <MainWithHeader>
          {Boolean(hasDocuments || search.filter) && (
            <DocumentListController
              collection={collection}
              createNewHref={createNewHref}
              enableFilters
              filters={search.filter}
              onUpdateFilters={this.handleFiltersUpdate}
            />
          )}

          <div className={styles['list-container']}>{this.renderMain()}</div>
        </MainWithHeader>

        <div className={styles.toolbar}>
          <NotificationCentre />

          {hasDocuments && (
            <DocumentListToolbar
              metadata={metadata}
              onPageChange={this.handlePageChange}
              selectedDocuments={selection}
            >
              <Button
                accent="negative"
                className={styles['delete-button']}
                data-name="delete-button"
                disabled={selection.length === 0}
                onClick={this.showDeletePrompt}
              >
                Delete{selection.length > 0 ? ` (${selection.length})` : ''}
              </Button>
            </DocumentListToolbar>
          )}
        </div>
      </>
    )
  }

  renderMain() {
    const {collection, contentKey, route, selection} = this.props
    const {filter, order, page, sort} = route.search

    if (collection.IS_MEDIA_BUCKET) {
      return (
        <DocumentList
          collection={Constants.MEDIA_COLLECTION_SCHEMA}
          contentKey={contentKey}
          filters={filter}
          onEmptyList={this.handleEmptyDocumentList}
          onNetworkError={this.handleNetworkError}
          onRender={({
            documents,
            hasSelection,
            onSelect,
            selectedDocuments
          }) => (
            <MediaList
              documents={documents}
              isFilteringSelection={filter && filter.$selected}
              hasSelection={hasSelection}
              onBuildBaseUrl={this.buildBaseUrl}
              onSelect={onSelect}
              order={order}
              selectedDocuments={selectedDocuments}
              sort={sort}
            />
          )}
          onSelect={this.handleSelect}
          order={order}
          page={page}
          selectAllHotKey="mod+a"
          selection={selection}
          sort={sort}
        />
      )
    }

    // Filtering visible fields.
    const visibleFields = Object.keys(
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
        filters={filter}
        onEmptyList={this.handleEmptyDocumentList}
        onNetworkError={this.handleNetworkError}
        onRender={({documents, onSelect, selectedDocuments}) => (
          <DocumentTableList
            collection={collection}
            documents={documents}
            fields={visibleFields}
            onBuildBaseUrl={this.buildBaseUrl}
            onSelect={onSelect}
            onSort={this.handleSort}
            order={order}
            selectedDocuments={selectedDocuments}
            sort={sort}
            title={collection.name}
          />
        )}
        onSelect={this.handleSelect}
        order={order}
        page={page}
        selection={selection}
        sort={sort}
      />
    )
  }
}

function mapState(state, ownProps) {
  const {
    isSingleDocument,
    route: {params, search, searchString}
  } = ownProps

  const collection =
    params.collection === Constants.MEDIA_COLLECTION_SCHEMA.slug
      ? Constants.MEDIA_COLLECTION_SCHEMA
      : state.app.config.api.collections.find(collection => {
          return collection.slug === params.collection
        })

  const {group} = params
  const contentKey = isSingleDocument
    ? JSON.stringify({collection: collection && collection.slug})
    : JSON.stringify({
        collection: collection && collection.slug,
        group,
        page: search.page || 1,
        searchString
      })
  const selectionKey = JSON.stringify({
    collection: collection && collection.slug,
    group
  })
  const selection = state.selection[selectionKey] || []

  return {
    collection,
    contentKey,
    selection,
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
