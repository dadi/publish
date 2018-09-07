'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'
import {connect} from 'preact-redux'
import {route} from '@dadi/preact-router'
import {bindActionCreators} from 'redux'

import Style from 'lib/Style'
import styles from './MediaEdit.css'

import * as Constants from 'lib/constants'
import * as appActions from 'actions/appActions'
import * as mediaActions from 'actions/mediaActions'
import * as mediaActions from 'actions/mediaActions'
import * as routerActions from 'actions/routerActions'
import * as fieldComponents from 'lib/field-components'

import APIBridge from 'lib/api-bridge-client'
import {visibleFieldList, filterVisibleFields} from 'lib/fields'
import {buildUrl} from 'lib/router'
import {connectHelper} from 'lib/util'
import {Format} from 'lib/util/string'

import ErrorMessage from 'components/ErrorMessage/ErrorMessage'
import TabbedFieldSections from 'components/TabbedFieldSections/TabbedFieldSections'

/**
 * The interface for editing a media.
 */
class MediaEdit extends Component {
  static propTypes = {

    /**
      * The global actions object.
    */
    actions: proptypes.object,

    /**
     * The name of the bucket currently being listed.
     */
    bucket: proptypes.string.isRequired,

    /**
     * The ID of the media being edited.
     */
    mediaId: proptypes.string,

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
     * The name of a reference field currently being edited.
     */
    referencedField: proptypes.string,

    /**
     * The current active section (if any).
     */
    section: proptypes.string,

    /**
     * The global state object.
     */
    state: proptypes.object
  }

  constructor(props) {
    super(props)

    this.hasFetched = false
  }

  shouldComponentUpdate(nextProps, nextState) {
    const {
      bucket,
      mediaId,
      group,
      onPageTitle,
      section,
      state
    } = this.props

    const {currentApi, currentBucket} = state.api
    const method = mediaId ? 'edit' : 'new'

    if (typeof onPageTitle === 'function') {
      onPageTitle(`${Format.sentenceCase(method)} media`)  
    }

    if (currentBucket) {
      const bucketFields = filterVisibleFields({
        fields: currentBucket.fields,
        view: 'edit'
      })
      const fields = this.groupFields(bucketFields)

      if (section) {
        const sectionMatch = fields.sections.find(fieldSection => {
          return fieldSection.slug === section
        })

        if (!sectionMatch) {
          const firstSection = fields.sections[0]

          // Redirect to first section.
          route(
            this.buildHref(method, firstSection)
          )

          return false
        }
      }
    }
  }

  handleRoomChange() {
    const {state, actions, mediaId} = this.props

    if (mediaId && state.router.room !== mediaId) {
      actions.roomChange(mediaId)
    }
  }

  componentWillUpdate(nextProps, nextState) {
    this.handleRoomChange()
  }

  componentDidUpdate(previousProps, previousState) {
    const {
      actions,
      bucket,
      mediaId,
      group,
      state
    } = this.props
    const {currentApi, currentBucket} = state.api
    const media = state.media
    const previousMedia = previousProps.state.media

    // Are there unsaved changes?
    if (
      !previousMedia.local &&
      media.local &&
      media.hasLoadedFromLocalStorage
    ) {
      const notification = {
        dismissAfterSeconds: false,
        fadeAfterSeconds: 5,
        message: 'You have unsaved changes',
        options: {
          'Discard them?': actions.discardUnsavedChanges.bind(this, {
            bucket,
            group
          })
        }
      }

      actions.setNotification(notification)
    }

    // If there's an error, stop here.
    if (this.hasFetched && media.remoteError) {
      return
    }

    // There's no media ID, so it means we're creating a new media.
    if (!mediaId) {
      if (currentBucket) {
        actions.startNewMedia({
          bucket: currentBucket,
          group
        })
      }

      return
    }

    // We're editing an existing media. We need to fetch it from the remote
    // API if:
    //
    // - We're not already in the process of fetching one AND
    // - There is no media in the store OR the media id has changed AND
    // - All APIs have buckets
    const remoteMediaHasChanged = media.remote &&
      (mediaId !== media.remote._id)
    const needsFetch = !media.remote || remoteMediaHasChanged

    if (
      !media.isLoading &&
      needsFetch &&
      currentBucket &&
      state.api.apis.length > 0
    ) {
      this.handleRoomChange()
      this.fetchMedia()
    }
  }

  componentWillMount() {
    const {
      actions,
      bucket,
      mediaId,
      group,
      onGetRoutes,
      state
    } = this.props

    this.userLeavingMediaHandler = this.handleUserLeavingMedia.bind(this)

    window.addEventListener('beforeunload', this.userLeavingMediaHandler)

    if (state.media.remote && state.media.remote._id !== mediaId) {
      actions.clearRemoteMedia()
    }
  }

  componentWillUnmount() {
    const {
      actions
    } = this.props

    window.removeEventListener('beforeunload', this.userLeavingMediaHandler)
    actions.roomChange(null)
  }

  render() {
    const {
      bucket,
      mediaId,
      group,
      referencedField,
      section,
      state
    } = this.props
    const media = state.media

    if (media.remoteError) {
      return (
        <ErrorMessage
          data={{href: buildUrl(group, bucket)}}
          type={Constants.ERROR_DOCUMENT_NOT_FOUND}
        />
      )
    }

    if (media.isLoading || !media.local) {
      return null
    }

    const bucketFields = filterVisibleFields({
      fields: state.api.currentBucket.fields,
      view: 'edit'
    })
    const fields = this.groupFields(bucketFields)
    const sections = fields.sections || [{
      slug: 'other',
      fields: fields.other
    }]
    const activeSection = section || sections[0].slug
    const hasValidationErrors = media.validationErrors
    const method = mediaId ? 'edit' : 'new'

    // Add a link to each section before passing it down.
    sections.forEach(section => {
      section.href = this.buildHref(method, section)
    })

    return (
      <TabbedFieldSections
        activeSection={activeSection}
        renderField={this.renderField.bind(this)}
        sections={sections}
      />
    )
  }

  buildHref(method, section) {
    const {
      bucket,
      mediaId,
      onBuildBaseUrl,
      state
    } = this.props

    return onBuildBaseUrl({
      createNew: !Boolean(mediaId),
      search: state.router.search,
      section: section && section.slug,
    })
  }

  // Fetches a media from the remote API
  fetchMedia() {
    const {
      actions,
      bucket,
      mediaId,
      state
    } = this.props

    // As far as the fetch method is concerned, we're only interested in the
    // bucket of the main media, not the referenced one.
    let parentBucket = state.api.currentParentBucket || state.api.currentBucket
    let bucketFields = visibleFieldList({
      fields: parentBucket.fields,
      view: 'edit'
    })
    let query = {
      api: state.api.currentApi,
      bucket: parentBucket,
      id: mediaId,
      fields: bucketFields
    }

    actions.fetchMedia(query)

    this.hasFetched = true
  }

  // Groups fields by section based on the `section` property of the `publish`
  // block present in their schema. It returns an object with two properties:
  //
  // - `sections`: an array of sections, each containing:
  //    - `fields`: array containing the schema of the fields in the section
  //    - `hasErrors`: Boolean indicating whether there are fields with errors
  //                   in the section
  //    - `name`: name of the section
  //    - `slug`: slug of the section
  // - `other`: array containing the schemas of fields without a section
  groupFields(fields) {
    const {state} = this.props
    const media = state.media

    let sections = {}
    let sectionsArray = null
    let other = []

    Object.keys(fields).forEach(fieldSlug => {
      const field = Object.assign({}, fields[fieldSlug], {
        _id: fieldSlug
      })
      const section = field.publish && field.publish.section

      if (section) {
        sections[section] = sections[section] || []
        sections[section].push(field)
      } else {
        other.push(field)
      }
    })

    // Converting sections to an array including slug
    if (Object.keys(sections).length) {
      sectionsArray = Object.keys(sections).map(sectionName => {
        const fields = sections[sectionName]
        const sectionHasErrors = media.validationErrors
          && fields.some(field => media.validationErrors[field._id])

        let section = {
          fields,
          hasErrors: sectionHasErrors,
          name: sectionName,
          slug: Format.slugify(sectionName)
        }

        return section
      })
    }

    return {
      sections: sectionsArray,
      other
    }
  }

  // Handles the callback that fires whenever a field changes and the new value
  // is ready to be sent to the store.
  handleFieldChange(fieldName, value, persistInLocalStorage = true) {
    const {
      actions,
      bucket,
      group
    } = this.props

    actions.updateLocalMedia({
      [fieldName]: value
    }, {
      bucket,
      group,
      persistInLocalStorage
    })
  }

  // Handles the callback that fires whenever there's a new validation error
  // in a field or when a validation error has been cleared.
  handleFieldError(fieldName, hasError, value) {
    const {actions} = this.props

    actions.setFieldErrorStatus(fieldName, value, hasError)
  }

  handleUserLeavingMedia() {
    const {
      actions,
      mediaId,
      group,
      state
    } = this.props

    actions.registerUserLeavingMedia({
      bucket: state.api.currentBucket.name,
      mediaId,
      group
    })
  }

  // Renders a field, deciding which component to use based on the field type
  renderField(field) {
    const {
      bucket,
      mediaId,
      group,
      onBuildBaseUrl,
      state
    } = this.props
    const {api, app, media} = state
    const hasAttemptedSaving = media.saveAttempts > 0
    const hasError = media.validationErrors
      && media.validationErrors[field._id]
    const mediaData = Object.assign({}, media.remote, media.local)
    const defaultApiLanguage = api.currentApi.i18n.defaultLanguage
    const currentLanguage = state.router.search.lang
    const isTranslatable = field.type.toLowerCase() === 'string'
    const isTranslation = currentLanguage &&
      currentLanguage !== defaultApiLanguage

    let displayName = field.label || field._id
    let fieldName = field._id
    let placeholder = field.placeholder

    if (isTranslation && isTranslatable) {
      let language = api.currentApi.languages.find(language => {
        return language.code === currentLanguage
      })

      if (language) {
        displayName += ` (${language.name})`
      }

      fieldName += api.currentApi.i18n.fieldCharacter + currentLanguage
      placeholder = mediaData[field._id] || placeholder
    }

    let value = mediaData[fieldName]

    // As per API docs, validation messages are in the format "must be xxx", which
    // assumes that something (probably the name of the field) will be prepended to
    // the string to form a final error message. For this reason, we're prepending
    // the validation message with "This field", but this is something that we can
    // easily revisit.
    const error = typeof hasError === 'string' ?
      'This field ' + hasError :
      hasError
    const fieldType = field.publish &&
      field.publish.subType ?
        field.publish.subType :
        field.type
    const fieldComponentName = `Field${fieldType}`
    const FieldComponent = fieldComponents[fieldComponentName] &&
      fieldComponents[fieldComponentName].edit

    if (!FieldComponent) {
      console.warn('Unknown field type:', fieldType)

      return null
    }

    let fieldStyles = new Style(styles, 'field')

    fieldStyles.addIf('field-disabled', isTranslation && !isTranslatable)

    return (
      <div class={fieldStyles.getClasses()}>
        <FieldComponent
          bucket={bucket}
          config={app.config}
          currentApi={api.currentApi}
          currentBucket={api.currentBucket}
          displayName={displayName}
          mediaId={mediaId}
          error={error}
          forceValidation={hasAttemptedSaving}
          group={group}
          name={fieldName}
          onBuildBaseUrl={onBuildBaseUrl}
          onChange={this.handleFieldChange.bind(this)}
          onError={this.handleFieldError.bind(this)}
          placeholder={placeholder}
          required={field.required && !isTranslation}
          schema={field}
          value={value}
        />
      </div>
    )
  }
}

export default connectHelper(
  state => ({
    api: state.api,
    app: state.app,
    media: state.media,
    user: state.user,
    router: state.router
  }),
  dispatch => bindActionCreators({
    ...appActions,
    ...mediaActions,
    ...mediaActions,
    ...routerActions
  }, dispatch)
)(MediaEdit)
