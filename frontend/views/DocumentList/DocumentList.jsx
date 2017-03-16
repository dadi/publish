import {h, Component} from 'preact'
import {connect} from 'preact-redux'
import {route} from 'preact-router'
import {bindActionCreators} from 'redux'

import Style from 'lib/Style'
import styles from './DocumentList.css'

import * as apiActions from 'actions/apiActions'
import * as documentsActions from 'actions/documentsActions'

import {connectHelper, isValidJSON} from 'lib/util'
import * as Constants from 'lib/constants'
import {Keyboard} from 'lib/keyboard'
import {router, createRoute, buildUrl} from 'lib/router'
import APIBridge from 'lib/api-bridge-client'
import {getCurrentApi, getCurrentCollection} from 'lib/app-config'

import Button from 'components/Button/Button'
import DocumentFilters from 'components/DocumentFilters/DocumentFilters'
import ListController from 'components/ListController/ListController'
import Paginator from 'components/Paginator/Paginator'
import SyncTable from 'components/SyncTable/SyncTable'
import SyncTableRow from 'components/SyncTable/SyncTableRow'
import Toolbar from 'components/Toolbar/Toolbar'
import ToolbarTextInput from 'components/Toolbar/ToolbarTextInput'

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
    const currentCollection = getCurrentCollection(state.api.apis, group, collection)

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
    const {metadata} = documents.list

    return (
      <div class={styles.container}>
        <section class="Documents">
          <ListController
            collection={currentCollection}
            search={true}
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
                        <a href={buildUrl(group, collection, 'document/edit', data._id)}>{value}</a>
                      )
                    }

                    return value
                  }}
                />
              )
            })}
          </SyncTable>
        </section>

        <Toolbar>
          <div>
            <ToolbarTextInput
              onChange={this.handleGoToPage.bind(this)}
              size="small"
              placeholder="Go to page"
            />

            <span style="margin-left: 15px;">
              Showing <strong>{`${metadata.offset + 1}-${Math.min(metadata.offset + metadata.limit, metadata.totalCount)} `}</strong>
              of <strong>{metadata.totalCount}</strong>
            </span>
          </div>

          <div>
            <Paginator
              currentPage={metadata.page}
              linkCallback={page => buildUrl(group, collection, 'documents', page)}
              maxPages={8}
              totalPages={metadata.totalPages}
            />
          </div>

          <div>
            <p>Something</p>
          </div>
        </Toolbar>
      </div>
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

    // State check: reject when there are still APIs without collections
    const apisWithoutCollections = state.api.apis.filter(api => !api.collections).length

    if (apisWithoutCollections) return

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
      group,
      order,
      page,
      sort,
      state
    } = this.props

    const sortBy = sort || 'createdAt'
    const sortOrder = order || 'desc'
    const currentApi = getCurrentApi(state.api.apis, group, collection)
    const currentCollection = getCurrentCollection(state.api.apis, group, collection)
    const count = currentCollection.settings && currentCollection.settings.count || 20

    // Set document loading status to 'Loading'
    actions.setDocumentListStatus(Constants.STATUS_LOADING)

    let query = APIBridge(currentApi)
      .in(currentCollection.name)
      .limitTo(count)
      .goToPage(page)
      .sortBy(sortBy, sortOrder)

    if (filter && isValidJSON(filter)) {
      let filters = JSON.parse(this.props.filter)

      query.where(filters)
    }

    return query.find().then(docs => {
      // Update state with results
      actions.setDocumentList(docs)
    }).catch(err => {
      console.log(err)
      //actions.clearDocumentList()
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

  handleGoToPage(event) {
    const {collection, group, state} = this.props
    const {documents} = state
    const inputValue = event.target.value
    const parsedValue = parseInt(inputValue)

    // If the input is not a valid positive integer number, we return.
    if ((parsedValue.toString() !== inputValue) || (parsedValue <= 0)) return

    // If the number inserted is outside the range of the pages available,
    // we return.
    if (parsedValue > documents.list.metadata.totalPages) return

    route(buildUrl(group, collection, 'documents', parsedValue))
  }
}

export default connectHelper(
  state => state,
  dispatch => bindActionCreators({...documentsActions, ...apiActions}, dispatch)
)(DocumentList)
