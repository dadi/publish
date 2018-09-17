'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'
import {connect} from 'preact-redux'
import {bindActionCreators} from 'redux'
import {route} from '@dadi/preact-router'
import {Keyboard} from 'lib/keyboard'

import * as Constants from 'lib/constants'
import * as appActions from 'actions/appActions'
import * as mediaActions from 'actions/mediaActions'
import * as mediaActions from 'actions/mediaActions'
import * as fieldComponents from 'lib/field-components'

import APIBridge from 'lib/api-bridge-client'
import {buildUrl, createRoute} from 'lib/router'
import {filterVisibleFields} from 'lib/fields'
import {connectHelper} from 'lib/util'

import Button from 'components/Button/Button'
import ErrorMessage from 'components/ErrorMessage/ErrorMessage'
import HeroMessage from 'components/HeroMessage/HeroMessage'
import SyncTable from 'components/SyncTable/SyncTable'

/**
 * A table view with a list of media.
 */
class MediaList extends Component {
  static propTypes = {
    /**
     * The global actions object.
     */
    actions: proptypes.object,

    /**
     * The name of the bucket currently being listed.
     */
    bucket: proptypes.string,

    /**
     * The JSON-stringified object of active filters.
     */
    filter: proptypes.string,

    /**
     * The name of the group where the current bucket belongs (if any).
     */
    group: proptypes.string,

    /**
    * A callback to be used to obtain the base URL for the given page, as
    * determined by the view.
    */
    onBuildBaseUrl: proptypes.func,

    /**
     * A callback to be fired if the container wants to attempt changing the
     * page title.
     */
    onPageTitle: proptypes.func,

    /**
     * The order used to sort the media by the `sort` field.
     */
    order: proptypes.oneOf(['asc', 'desc']),

    /**
     * The number of the current active page.
     */
    page: proptypes.number,

    /**
     * When on a reference field, contains the ID of the parent media.
     */
    mediaId: proptypes.string,

    /**
     * The name of a reference field currently being edited.
     */
    referencedField: proptypes.string,

    /**
     * The name of the field currently being used to sort the media.
     */
    sort: proptypes.string,

    /**
     * The global state object.
     */
    state: proptypes.object
  }

  static defaultProps = {
    onPageTitle: (function () {})
  }

  constructor(props) {
    super(props)

    this.keyboard = new Keyboard()
  }

  componentDidMount() {
    const {
      onBuildBaseUrl,
      page,
      state
    } = this.props
    const currentPage = Number(page)
    const nextPage = currentPage + 1
    const previousPage = Math.abs(currentPage -1)

    this.keyboard.on('cmd+right')
      .do(cmd => route(buildUrl(...onBuildBaseUrl(), nextPage)))
    this.keyboard.on('cmd+left')
      .do(cmd => route(buildUrl(...onBuildBaseUrl(), previousPage)))
  }

  componentDidUpdate(prevProps) {
    const {
      actions,
      referencedField,
      state
    } = this.props
    const media = state.media
    const pathKey = prevProps.state.router.locationBeforeTransitions.key
    const previousMedias = prevProps.state.media
    const previousPathKey = state.router.locationBeforeTransitions.key

    // If we are have just loaded a list of media for a nested media,
    // let's update the selection with the value of the reference field, if
    // it is in view.
    if (referencedField && previousMedias.isLoading && !media.isLoading) {
      let media = Object.assign(
        {},
        state.media.remote,
        state.media.local
      )
      let referencedValues = media[referencedField]
      let referencedIds = (Array.isArray(referencedValues)
        ? referencedValues.map(value => value._id)
        : [referencedValues && referencedValues._id]
      ).filter(Boolean)

      if (referencedIds.length > 0) {
        actions.setMediaSelection(referencedIds)
      }
    }

    // State check: reject when path matches and media list loaded
    if (media.list && (pathKey === previousPathKey)) {
      return
    }

    this.checkStatusAndFetch()
  }

  componentWillUpdate(nextProps) {
    const {actions, state} = this.props
    const {state: nextState} = nextProps
    const currentBucket = state.api.currentBucket
    const nextBucket = nextState.api.currentBucket

    // This is required to recover from an error. If the media list has
    // errored and we're about to navigate to a different bucket, we
    // clear the error state by setting the status to IDLE and let the
    // container fetch again.
    if (
      state.media.remoteError &&
      currentBucket &&
      nextBucket &&
      (currentBucket.path !== nextBucket.path)
    ) {
      actions.setMediaListStatus(Constants.STATUS_IDLE)
    }
  }

  render() {
    const {
      bucket,
      filter,
      group,
      onBuildBaseUrl,
      order,
      referencedField,
      sort,
      state
    } = this.props
    const media = state.media
    const {currentBucket} = state.api
    const createLink = onBuildBaseUrl({
      createNew: true
    })

    if (media.remoteError) {
      return (
        <ErrorMessage
          type={Constants.ERROR_ROUTE_NOT_FOUND}
        />
      )      
    }

    if (
      !media.list ||
      !media.list.results ||
      media.isLoading ||
      !currentBucket
    ) {
      return null
    }

    const mediaList = media.list

    if (!mediaList.results.length && !media.query) {
      return (
        <HeroMessage
          title="No media yet."
          subtitle="Once created, they will appear here."
        >
          {!referencedField && (
            <Button
              accent="save"
              href={createLink}
            >Create new media</Button>
          )}
        </HeroMessage>
      )
    }

    return this.renderMediaList()
  }

  componentWillMount() {
    this.checkStatusAndFetch()
  }

  checkStatusAndFetch() {
    const {state} = this.props
    const {isLoading, list, status} = state.media

    // State check: reject when missing config, session, or apis
    if (!state.app.config || !state.api.apis.length || !state.api.currentBucket) {
      return
    }

    if (!isLoading) {
      this.fetchMedias()  
    }
  }

  componentWillUnmount() {
    const {actions} = this.props

    this.keyboard.off()
    actions.clearMediaList()
  }

  fetchMedias() {
    const {
      actions,
      bucket,
      filter,
      group,
      order,
      page,
      mediaId,
      referencedField,
      sort,
      state
    } = this.props
    const {
      currentApi,
      currentBucket,
      currentParentBucket
    } = state.api

    if (state.media.remoteError) {
      return
    }

    let count = (currentBucket.settings && currentBucket.settings.count)
      || 20
    let filterValue = state.router.search ? state.router.search.filter : null

    actions.fetchMedias({
      api: currentApi,
      bucket: currentBucket,
      count,
      filters: filterValue,
      page,
      parentBucket: currentParentBucket,
      parentMediaId: mediaId,
      referencedField,
      sortBy: sort,
      sortOrder: order
    })
  }

  getSelectedRows() {
    const {state} = this.props
    const media = state.media.list.results
    const selectedMedias = state.media.selected

    let selectedRows = {}

    media.forEach((media, index) => {
      if (selectedMedias.includes(media._id)) {
        selectedRows[index] = true
      }
    })

    return selectedRows
  }

  handleAnchorRender(value, data, column, index) {
    const {
      bucket,
      mediaId,
      group,
      onBuildBaseUrl,
      referencedField,
      state
    } = this.props

    // If we're on a nested media view, we don't want to add links to
    // media (for now).
    if (referencedField) {
      return value
    }

    let editLink = onBuildBaseUrl({
      mediaId: mediaId || data._id
    })
    let currentBucket = state.api.currentBucket
    let fieldSchema = currentBucket.fields[column.id]
    let renderedValue = this.renderField(column.id, fieldSchema, value)

    if (index === 0) {
      return (
        <a href={editLink}>{renderedValue}</a>
      )
    }

    return renderedValue
  }

  handleRowSelect(selectedRows) {
    const {actions, state} = this.props
    const media = state.media.list.results
    const selectedMedias = state.media.selected

    // This is the subset of selected media that are currently not in view.
    // We'll leave these alone.
    const selectedNotInView = selectedMedias.filter(mediaId => {
      const matchingMedia = media.find(media => {
        return media._id === mediaId
      })

      return !matchingMedia
    })

    // This is the new subset of selected media that are in view.
    const selectedInView = Object.keys(selectedRows)
      .filter(index => selectedRows[index])
      .map(index => media[index]._id)

    // The new selection will be a combination of the two arrays.
    const newSelection = selectedNotInView.concat(selectedInView)

    actions.setMediaSelection(newSelection)
  }

  handleTableSort(value, sortBy, sortOrder) {
    return (
      <a href={createRoute({
        params: {sort: sortBy, order: sortOrder},
        update: true
      })}>{value}</a>
    )
  }

  renderMediaList() {
    const {
      bucket,
      group,
      referencedField,
      onPageTitle,
      order,
      sort,
      state
    } = this.props
    const {currentBucket, currentParentBucket} = state.api
    const media = state.media.list.results
    const config = state.app.config
    const selectedRows = this.getSelectedRows()

    let selectLimit = Infinity

    // If we're on a reference field select view, we'll see if there's a field
    // component for the referenced field type that exports a `referenceSelect`
    // context. If it does, we'll use that instead of the default `SyncTable`
    // to render the results.
    if (referencedField) {
      const fieldSchema = currentParentBucket.fields[referencedField]
      const fieldType = (fieldSchema.publish && fieldSchema.publish.subType) || fieldSchema.type
      const fieldComponentName = `Field${fieldType}`
      const FieldComponentReferenceSelect = fieldComponents[fieldComponentName].referenceSelect
      if (
        fieldSchema.settings &&
        fieldSchema.settings.limit &&
        fieldSchema.settings.limit > 0
      ) {
        selectLimit = fieldSchema.settings.limit
      }

      if (FieldComponentReferenceSelect) {
        return (
          <FieldComponentReferenceSelect
            config={config}
            data={media}
            onSelect={this.handleRowSelect.bind(this)}
            onSort={this.handleTableSort.bind(this)}
            selectedRows={selectedRows}
            selectLimit={selectLimit}
            sortBy={sort}
            sortOrder={order}
          />
        )
      }

      onPageTitle(`Select ${(fieldSchema.label || referencedField).toLowerCase()}`)
    } else {
      onPageTitle(currentBucket.settings.description || currentBucket.name)
    }
    const listableFields = filterVisibleFields({
      fields: currentBucket.fields,
      view: 'list'
    })

    const tableColumns = Object.keys(listableFields)
      .map(field => {
        if (!currentBucket.fields[field]) return

        return {
          id: field,
          label: currentBucket.fields[field].label
        }
      })

    if (media.length > 0) {
      return (
        <SyncTable
          columns={tableColumns}
          data={media}
          onRender={this.handleAnchorRender.bind(this)}
          onSelect={this.handleRowSelect.bind(this)}
          onSort={this.handleTableSort.bind(this)}
          selectedRows={selectedRows}
          selectLimit={selectLimit}
          sortable={true}
          sortBy={sort}
          sortOrder={order}
        />
      )
    }

    return (
      <HeroMessage
        title="No media found."
        subtitle="We can't find anything matching those filters."
      >
        <Button
          accent="system"
          href={buildUrl(group, bucket, 'media')}
        >Clear filters</Button>
      </HeroMessage>
    )
  }

  renderField(fieldName, schema, value) {
    if (!schema) return

    const fieldType = (schema.publish && schema.publish.subType) ?
      schema.publish.subType : schema.type
    const fieldComponentName = `Field${fieldType}`
    const FieldComponentList = fieldComponents[fieldComponentName] &&
      fieldComponents[fieldComponentName].list

    if (FieldComponentList) {
      return (
        <FieldComponentList
          schema={schema}
          value={value}
        />
      )
    }

    return value
  }
}

export default connectHelper(
  state => ({
    api: state.api,
    app: state.app,
    media: state.media,
    media: state.media,
    router: state.router,
    user: state.user
  }),
  dispatch => bindActionCreators({
    ...appActions,
    ...mediaActions,
    ...mediaActions
  }, dispatch)
)(MediaList)
