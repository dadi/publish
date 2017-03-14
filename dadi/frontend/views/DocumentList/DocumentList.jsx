import {h, Component} from 'preact'
import {connect} from 'preact-redux'
import {bindActionCreators} from 'redux'

import * as apiActions from 'actions/apiActions'
import * as documentsActions from 'actions/documentsActions'

import {connectHelper, isValidJSON} from 'lib/util'
import * as Constants from 'lib/constants'
import {Keyboard} from 'lib/keyboard'
import {router, createRoute, buildUrl} from 'lib/router'
import APIBridge from 'lib/api-bridge-client'

import Button from 'components/Button/Button'
import DocumentFilters from 'components/DocumentFilters/DocumentFilters'
import ListController from 'components/ListController/ListController'
import SyncTable from 'components/SyncTable/SyncTable'
import SyncTableRow from 'components/SyncTable/SyncTableRow'

class DocumentList extends Component {
  constructor(props) {
    super(props)

    this.keyboard = new Keyboard()
    this.state.filtersVisible = false
  }

  render() {
    const {
      collection,
      filter,
      group,
      order,
      sort,
      state
    } = this.props
    const {filtersVisible} = this.state
    const documents = state.documents
    const currentCollection = state.api.currentCollection

    if (!documents.list || documents.status === Constants.STATUS_LOADING || !currentCollection) {
      return null
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
        <ListController
          search={`Search in ${currentCollection.name}...`}
        >
          <Button
            accent="data"
            onClick={this.handleFiltersToggle.bind(this)}
          >Filters</Button>
          <Button accent="save">Create new</Button>
        </ListController>

        <div style={!filtersVisible && "display: none;"}>
          <DocumentFilters
            filter={filter}
            collection={currentCollection}
            updateUrlParams={this.updateUrlParams.bind(this)}
          />
        </div>

        <SyncTable
          columns={tableColumns}
          sortable={true}
          sortBy={sort}
          sortOrder={order}
          sort={(value, sortBy, sortOrder) => {
            return (
              <a href={createRoute({
                params: {sort: sortBy, order: sortOrder}, 
                update: true
              })}>{value}</a>
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
                      <a href={buildUrl(group, currentCollection.name, 'document/edit', data._id)}>{value}</a>
                    )
                  }

                  return value
                }}
              />
            )
          })}
        </SyncTable>

        {Array(documents.list.metadata.totalPages).fill().map((_, page) => (
          <a href={createRoute({
            path: [group, currentCollection.name, 'documents', page+1],
            update: true
          })}>{page+1}</a>
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

  getDocumentList() {
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
      .in(collection)
      .limitTo(20) // Config based on collection schema
      .goToPage(page)
      .sortBy(sortBy, sortOrder)

    if (filter && isValidJSON(filter)) {
      let filters = JSON.parse(this.props.filter)

      query.where(filters)
    }

    return query.find().then(docs => {
      // Filter current collection
      const currentCollection = state.api.apis[0].collections.find(stateCollection => {
        return stateCollection.slug === collection
      })

      // Update state with results
      actions.setDocumentList(docs, collection)
    }).catch(err => {
      console.log(err)
      actions.clearDocumentList()
      // {!} TODO: Graceful deal with failure
    })
  }

  updateUrlParams (filters) {
    const {actions, state} = this.props
    
    // Replace existing filters
    router({params: {filter: filters}, update: true})
  }

  handleFiltersToggle() {
    this.setState({
      filtersVisible: !this.state.filtersVisible
    })
  }
}

export default connectHelper(
  state => state,
  dispatch => bindActionCreators({...documentsActions, ...apiActions}, dispatch)
)(DocumentList)
