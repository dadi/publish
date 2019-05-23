import * as appActions from 'actions/appActions'
import * as Constants from 'lib/constants'
import * as documentActions from 'actions/documentActions'
import {connectRedux} from 'lib/redux'
import {getVisibleFields} from 'lib/fields'
import DocumentGridList from 'components/DocumentGridList/DocumentGridList'
import DocumentTableList from 'containers/DocumentTableList/DocumentTableList'
import MediaGridCard from 'containers/MediaGridCard/MediaGridCard'
import proptypes from 'prop-types'
import React from 'react'
import SpinningWheel from 'components/SpinningWheel/SpinningWheel'

class DocumentList extends React.Component {
  static propTypes = {
    /**
     * The global actions object.
     */
    actions: proptypes.object,

    /**
     * The collection to operate on.
     */
    collection: proptypes.object,

    /**
     * The unique cache key for the list of documents.
     */
    contentKey: proptypes.string,

    /**
     * The list of fields to retrieve.
     */
    fields: proptypes.array,

    /**
     * The hash map of active filters.
     */
    filters: proptypes.object,

    /**
     * The type of list to render documents with. If an `onRender` prop is
     * supplied, that takes precedence.
     */
    listType: proptypes.oneOf([
      'grid',
      'table'
    ]),

    /**
     * A callback to be used to obtain the base URL for the given page, as
     * determined by the view.
     */
    onBuildBaseUrl: proptypes.func,

    /**
     * A function to be called when the list has no documents to display.
     * It is called with the following named parameters:
     *
     * - selection
     */
    onEmptyList: proptypes.func,

    /**
     * A function responsible for rendering the loading state of the document
     * list.
     */
    onLoading: proptypes.func, 
   
    /**
     * A function responsible for rendering the documents, overriding the
     * default components (DocumentTableList and DocumentGridList).
     * It is called with the following named parameters:
     *
     * - documents
     * - onSelect
     * - selectedDocuments
     */
    onRender: proptypes.func,

    /**
     * The order used to sort the documents by the `sort` field.
     */
    order: proptypes.oneOf(['asc', 'desc']),

    /**
     * The number of the current active page.
     */
    page: proptypes.number,

    /**
     * An array containing the IDs of the selected documents.
     */
    selection: proptypes.array,

    /**
     * The name of the field currently being used to sort the documents.
     */
    sort: proptypes.string,

    /**
     * The global state object.
     */
    state: proptypes.object
  }

  static defaultProps = {
    listType: 'table',
    selection: []
  }

  componentWillMount() {
    this.fetch()
  }

  componentDidUpdate(oldProps) {
    const {contentKey, filters, selection, state} = this.props
    const {contentKey: oldContentKey} = oldProps
    const oldData = oldProps.state.documents[contentKey] || {}
    const newData = state.documents[contentKey] || {}
    const dataIsDirty = oldData.dirty === false && newData.dirty === true
    
    // If the component received a new content key or the data is dirty, which
    // may happen when documents are updated/deleted, we must fetch again.
    if (contentKey !== oldContentKey || dataIsDirty) {
      return this.fetch()
    }

    // If we're filtering the document list by selected state, we must fetch if
    // the selection has changed.
    if (filters && filters.$selected) {
      const oldSelectionKey = oldProps.selection.map(({_id}) => _id).join(',')
      const newSelectionKey = selection.map(({_id}) => _id).join(',')

      if (oldSelectionKey !== newSelectionKey) {
        return this.fetch()
      }
    }
  }

  fetch() {
    const {
      actions,
      collection,
      contentKey,
      filters = {},
      order,
      page,
      selection = [],
      sort
    } = this.props
    let bypassCache = false
    let sanitisedFilters

    if (filters.$selected) {
      const ids = selection.map(({_id}) => _id)

      sanitisedFilters = {
        ...filters,
        _id: {
          $in: ids
        },
        $selected: undefined
      }

      bypassCache = true
    } else {
      sanitisedFilters = filters
    }

    actions.fetchDocumentList({
      bypassCache,
      contentKey,
      collection,
      filters: sanitisedFilters,
      page,
      sortBy: sort,
      sortOrder: order
    })
  }

  render() {
    const {
      collection,
      contentKey,
      listType,
      onEmptyList,
      onLoading,
      onRender,
      onSelect,
      selection,
      state
    } = this.props
    const data = state.documents[contentKey]
    const documentsAreLoading = !data || data.isLoading

    if (documentsAreLoading) {
      // If there is a custom handler for the loading state, we'll call it.
      if (typeof onLoading === 'function') {
        return onLoading()
      }

      // If not, we render the SpinningWheel component.
      return <SpinningWheel/>
    }

    const {results} = data

    // If there are no results to display, we call the `onEmptyList` callback
    // if it is defined, or render `null` otherwise.
    if (results.length === 0) {
      if (typeof onEmptyList === 'function') {
        return onEmptyList({selection})
      }

      return null
    }

    // The list of selected documents is persisted in the store as an array of
    // IDs. However, for the components downstream it's more efficient to store
    // this data as a hash map, since each row will need to lookup this object
    // to assess whether it is selected or not. Making it a hash map means that
    // said lookup can be done in O(1) rather than O(n) time.
    const selectedDocumentsNotInView = []
    const selectedDocumentsInView = selection.reduce((result, document) => {
      const {_id: id} = document
      const matchingDocumentIndex = results.findIndex(item => {
        return item._id === id
      })

      if (matchingDocumentIndex === -1) {
        selectedDocumentsNotInView.push(document)
      } else {
        result[matchingDocumentIndex] = document
      }

      return result
    }, {})

    // This is an intermediate function that processes a selection from lower-
    // level components (e.g. Table) and computes a new selection array in a
    // format that the selection store will accept. This function calls the
    // `onSelect` handler passed as a prop.
    const documentListOnSelect = newSelection => {
      Object.keys(newSelection).forEach(index => {
        const document = results[index]

        if (!document._id) return

        selectedDocumentsInView[index] = newSelection[index]
          ? document
          : undefined
      })

      // Converting a new selection hash to the array format that the store
      // is expecting.
      const newSelectionArray = Object.keys(selectedDocumentsInView)
        .map(index => selectedDocumentsInView[index])
        .filter(Boolean)
        .concat(selectedDocumentsNotInView)

      if (typeof onSelect === 'function') {
        onSelect.call(this, newSelectionArray)
      }
    }

    const renderData = {
      documents: results,
      onSelect: documentListOnSelect,
      selectedDocuments: selectedDocumentsInView
    }

    // If there is a custom render function, we'll use it.
    if (typeof onRender === 'function') {
      return onRender(renderData)
    }

    return listType === 'grid'
      ? this.renderAsGrid(renderData)
      : this.renderAsTable(renderData)
  }

  renderAsGrid({documents, onSelect, selectedDocuments}) {
    const {state} = this.props
    const {cdn} = state.app.config

    return (
      <DocumentGridList
        documents={documents}
        onRenderCard={({item, isSelected, onSelect}) => {
          // If there is a CDN instance configured, we'll replace the
          // image base URL with the CDN URL.                    
          if (cdn && cdn.publicUrl) {
            item.url = `${cdn.publicUrl}${item.path}?width=500`
          }

          return (
            <MediaGridCard
              href={`/media/${item._id}`}
              key={item._id}
              isSelected={isSelected}
              item={item}
              onSelect={onSelect}
            />
          )
        }}
        onSelect={onSelect}
        selectedDocuments={selectedDocuments}
      />
    )    
  }

  renderAsTable({documents, onSelect, selectedDocuments}) {
    const {collection, onBuildBaseUrl, order, sort} = this.props

    // Filtering visible fields.
    const visibleFields = collection && Object.keys(
      getVisibleFields({
        fields: collection.fields,
        viewType: 'list'
      })
    ).concat(Constants.DEFAULT_FIELDS)

    return (
      <DocumentTableList
        collection={collection}
        documents={documents}
        fields={visibleFields}
        onBuildBaseUrl={onBuildBaseUrl.bind(this)}
        onSelect={onSelect}
        order={order}
        selectedDocuments={selectedDocuments}
        sort={sort}
      />
    )  
  }
}

export default connectRedux(
  appActions,
  documentActions,
)(DocumentList)
