import {h, Component} from 'preact'
import {connect} from 'preact-redux'
import {bindActionCreators} from 'redux'

import * as apiActions from 'actions/apiActions'
import * as documentActions from 'actions/documentActions'

import {connectHelper, isValidJSON} from 'lib/util'
import {Keyboard} from 'lib/keyboard'
import APIBridge from 'lib/api-bridge-client'

import DocumentFilters from 'components/DocumentFilters/DocumentFilters'
import SyncTable from 'components/SyncTable/SyncTable'
import SyncTableRow from 'components/SyncTable/SyncTableRow'

class DocumentList extends Component {
  constructor(props) {
    super(props)

    this.keyboard = new Keyboard()
  }

  render() {
    const {filter, state} = this.props
    const collection = state.document.collection
    const documents = state.document.list

    if (!state.document.list) {
      return (
        <p>Loading...</p>
      )
    }

    // We can change this to only display certain fields
    const fieldsToDisplay = Object.keys(collection.fields)
    const tableColumns = fieldsToDisplay.map(field => {
      return {
        id: field,
        label: collection.fields[field].label
      }
    })

    return (
      <section class="Documents">
        <DocumentFilters filter={filter} collection={collection} />

        <SyncTable
          columns={tableColumns}
          sortable={true}
          sortBy={state.document.sortBy}
          sortOrder={state.document.sortOrder}
          sort={(value, sortBy, sortOrder) => {
            return (
              <a href={`/${collection.name}/documents?sort=${sortBy}&order=${sortOrder}`}>
                {value}
              </a>
            )
          }}
        >

          {documents.results.map(document => {
            return (
              <SyncTableRow
                data={document}
                renderCallback={(value, data, column, index) => {
                  if (index === 0) {
                    return (
                      <a href={`/${collection.name}/document/edit/${data._id}`}>{value}</a>
                    )
                  }

                  return value
                }}
              />
            )
          })}
        </SyncTable>

        {Array(documents.metadata.totalPages).fill().map((_, page) => (
          <a href={ `/${this.props.collection}/documents/${page+1}` }>{page+1}</a>
        ))}
      </section>
    )
  }

  componentDidUpdate(previousProps) {
    const {state, actions} = this.props
    const previousState = previousProps.state
    const {list, listIsLoading} = state.document
    const newStatePath = state.routing.locationBeforeTransitions.pathname
    const newStateSearch = state.routing.locationBeforeTransitions.search
    const previousStatePath = previousState.routing.locationBeforeTransitions.pathname
    const previousStateSearch = previousState.routing.locationBeforeTransitions.search

    // State check: reject when missing config, session, or apis
    if (!state.app.config || !state.api.apis.length || !state.user) return
    // Fixed to checking first API, but will eventually need to check all
    if (!state.api.apis[0].collections || !state.api.apis[0].collections.length > 0) return
    // State check: reject when path matches and document list loaded
    if (list && (newStatePath === previousStatePath) && (newStateSearch === previousStateSearch)) return
    // State check: reject when documents are still loading
    if (listIsLoading) return
    this.getDocumentList()
  }

  componentDidMount() {
    this.keyboard.on('space+a').do(cmd => {
      console.log(cmd.pattern)
      // Trigger something
    })
  }

  componentWillUnmount() {
    const {actions} = this.props

    // Clear keyboard
    this.keyboard.off()
    actions.clearDocumentList()
  }

  getDocumentList(nextPage, nextCollection) {
    const {
      actions,
      collection,
      filter,
      order,
      page,
      sort,
      state
    } = this.props
    const sortBy = sort || 'createdAt'
    const sortOrder = order || 'desc'

    // Set document loading status to 'Loading'
    actions.setDocumentLoadingStatus(true)

    let query = APIBridge(state.api.apis[0])
      .in(nextCollection || collection)
      .limitTo(20) // Config based on collection schema
      .goToPage(nextPage || page)
      .sortBy(sortBy, sortOrder)

    if (filter && isValidJSON(filter)) {
      let filters = JSON.parse(this.props.filter)

      query.where(filters)
    }

    return query.find().then(docs => {
      // Filter current collection
      let currentCollection = state.api.apis[0].collections.find(stateCollection => {
        return stateCollection.slug === collection
      })

      // Update state with results
      actions.setDocumentList({
        documents: docs,
        collection: currentCollection,
        sortBy,
        sortOrder
      })
    }).catch((err) => {
      actions.clearDocumentList()

      // TODO: Graceful deal with failure
    })
  }
}

export default connectHelper(
  state => state,
  dispatch => bindActionCreators({...documentActions, ...apiActions}, dispatch)
)(DocumentList)
