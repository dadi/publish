import {h, Component} from 'preact'
import {connect} from 'preact-redux'
import {bindActionCreators} from 'redux'

import * as apiActions from 'actions/apiActions'
import * as documentsActions from 'actions/documentsActions'

import {connectHelper, isValidJSON} from 'lib/util'
import * as Constants from 'lib/constants'
import {Keyboard} from 'lib/keyboard'
import {router} from 'lib/router'
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
    const {collection, filter, order, sort, state} = this.props
    const documents = state.documents
    const currentCollection = state.api.currentCollection

    if (!documents.list || !currentCollection) {
      return (
        <p>Loading...</p>
      )
    }

    // We can change this to only display certain fields
    const fieldsToDisplay = Object.keys(currentCollection.fields)
    const tableColumns = fieldsToDisplay.map(field => {
      return {
        id: field,
        label: currentCollection.fields[field].label
      }
    })

    return (
      <section class="Documents">
        <DocumentFilters 
          filter={filter} 
          collection={currentCollection}
          updateUrlParams={this.updateUrlParams.bind(this)} 
        />

        <SyncTable
          columns={tableColumns}
          sortable={true}
          sortBy={sort}
          sortOrder={order}
          sort={(value, sortBy, sortOrder) => {
            return (
              <a href={`/${currentCollection.name}/documents?sort=${sortBy}&order=${sortOrder}`}>
                {value}
              </a>
            )
          }}
        >
          {documents.list.results.map(document => {
            return (
              <SyncTableRow
                data={document}
                renderCallback={(value, data, column, index) => {
                  if (index === 0) {
                    return (
                      <a href={`/${currentCollection.name}/document/edit/${data._id}`}>{value}</a>
                    )
                  }

                  return value
                }}
              />
            )
          })}
        </SyncTable>

        {Array(documents.list.metadata.totalPages).fill().map((_, page) => (
          <a href={`/${this.props.currentCollection}/documents/${page+1}`}>{page+1}</a>
        ))}
      </section>
    )
  }

  componentDidUpdate(previousProps) {
    const {state, actions} = this.props
    const previousState = previousProps.state
    const {list, status} = state.documents
    const newStatePath = state.router.locationBeforeTransitions.pathname
    const newStateSearch = state.router.locationBeforeTransitions.search
    const previousStatePath = previousState.router.locationBeforeTransitions.pathname
    const previousStateSearch = previousState.router.locationBeforeTransitions.search

    // State check: reject when missing config, session, or apis
    if (!state.app.config || !state.api.apis.length || !state.user) return

    // Fixed to checking first API, but will eventually need to check all
    if (!state.api.apis[0].collections || !state.api.apis[0].collections.length > 0) return

    // State check: reject when path matches and document list loaded
    if (list && (newStatePath === previousStatePath) && (newStateSearch === previousStateSearch)) return

    // State check: reject when documents are still loading
    if (status === Constants.STATUS_LOADING) return

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
    actions.setDocumentListStatus(Constants.STATUS_LOADING)

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
      actions.setDocumentList(docs, collection)
    }).catch((err) => {
      actions.clearDocumentList()
      // TODO: Graceful deal with failure
    })
  }

  updateUrlParams (filters) {
    const {actions, state} = this.props
    // Replace same with `filters`
    router({params: {filter: {email: 'am@dadi.co'}}, update: true})
  }
}

export default connectHelper(
  state => state,
  dispatch => bindActionCreators({...documentsActions, ...apiActions}, dispatch)
)(DocumentList)
