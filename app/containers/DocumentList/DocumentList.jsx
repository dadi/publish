import * as appActions from 'actions/appActions'
import * as documentActions from 'actions/documentActions'
import {connectRedux} from 'lib/redux'
import HotKeys from 'lib/hot-keys'
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
     * A callback to render an error message when there is a network error.
     */
    onNetworkError: proptypes.func,

    /**
     * A function responsible for rendering the documents. It is called with
     * the following named parameters:
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
     * If defined, listens to a hotkey combination to select all documents.
     */
    selectAllHotKey: proptypes.string,

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
    selection: []
  }

  constructor(props) {
    super(props)

    const shortcuts =
      typeof props.selectAllHotKey === 'string'
        ? {[props.selectAllHotKey]: this.selectAll.bind(this)}
        : null

    this.hotKeys = new HotKeys(shortcuts)
  }

  componentWillMount() {
    this.fetch()

    this.hotKeys.addListener()
  }

  componentWillUnmount() {
    this.hotKeys.removeListener()
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
      contentKey,
      onEmptyList,
      onLoading,
      onNetworkError,
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
      return <SpinningWheel />
    }

    const {metadata, results, error} = data

    if (error && error.toString().includes('NetworkError')) {
      return typeof onNetworkError === 'function' && onNetworkError({error})
    }

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
      metadata,
      onSelect: documentListOnSelect,
      selectedDocuments: selectedDocumentsInView
    }

    // If there is a render function, we'll use it.
    if (typeof onRender === 'function') {
      return onRender(renderData)
    }

    return null
  }

  selectAll() {
    const {contentKey, onSelect, selection, state} = this.props
    const data = state.documents[contentKey]

    if (typeof onSelect === 'function') {
      onSelect(data.results)
    }
  }
}

export default connectRedux(appActions, documentActions)(DocumentList)
