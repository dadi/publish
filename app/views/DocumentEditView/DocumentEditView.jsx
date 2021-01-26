import * as appActions from 'actions/appActions'
import * as Constants from 'lib/constants'
import * as documentActions from 'actions/documentActions'
import {connectRedux} from 'lib/redux'
import Document from 'containers/Document/Document'
import DocumentEditToolbar from 'containers/DocumentEditToolbar/DocumentEditToolbar'
import DocumentField from 'containers/DocumentField/DocumentField'
import EditInterface from 'components/EditInterface/EditInterface'
import EditInterfaceSection from 'components/EditInterface/EditInterfaceSection'
import ErrorMessage from 'components/ErrorMessage/ErrorMessage'
import ErrorView from 'views/ErrorView/ErrorView'
import {getVisibleFields} from 'lib/fields'
import Header from 'containers/Header/Header'
import MediaViewer from 'components/MediaViewer/MediaViewer'
import NotificationCentre from 'containers/NotificationCentre/NotificationCentre'
import React from 'react'
import {Redirect} from 'react-router-dom'
import ReferenceSelectView from 'views/ReferenceSelectView/ReferenceSelectView'
import {setPageTitle} from 'lib/util'
import {slugify} from 'shared/lib/string'
import styles from './DocumentEditView.css'

class DocumentEditView extends React.Component {
  constructor(props) {
    super(props)

    this.cancelReferenceSelection = this.cancelReferenceSelection.bind(this)
    this.saveReferenceSelection = this.saveReferenceSelection.bind(this)
    this.sections = []
    this.userClosingBrowser = this.handleUserClosingBrowser.bind(this)

    this.state = {
      referenceFieldSelected: null
    }
  }

  componentDidMount() {
    const {actions, contentKey, documentId} = this.props

    if (!documentId) {
      actions.startDocument({
        contentKey
      })
    }

    window.addEventListener('beforeunload', this.userClosingBrowser)
  }

  componentDidUpdate(oldProps) {
    const {
      state,
      actions,
      collection,
      contentKey,
      document,
      documentId
    } = this.props
    const {document: oldDocument} = oldProps
    const isSaving = (oldDocument.saveAttempts || 0) < document.saveAttempts

    // check if this page should be customized
    const customizedRouteConfig = state.app.config.api.routesWithDisabledCRUD
      ? state.app.config.api.routesWithDisabledCRUD.find(
          routeConfig => this.props.route.path === routeConfig.route
        )
      : false

    const shoulddisableUnsavedChangesNotification =
      customizedRouteConfig &&
      customizedRouteConfig.disableUnsavedChangesNotification

    // Are there unsaved changes?
    if (
      !shoulddisableUnsavedChangesNotification &&
      !document.isLoading &&
      document.wasLoadedFromLocalStorage &&
      !this.shownUnsavedChangesNotification
    ) {
      const notification = {
        dismissAfterSeconds: false,
        message: 'You have unsaved changes.',
        options: {
          'Discard changes': actions.discardUnsavedChanges.bind(this, {
            contentKey
          })
        },
        type: 'info'
      }

      actions.setNotification(notification)

      this.shownUnsavedChangesNotification = true
    }

    // If `wasLoadedFromLocalStorage` changed from false to true, it means the
    // user has started editing the document on top of the changes saved in
    // local storage, which effectively means accepting the changes. When that
    // happens, we can dismiss the notification.
    if (
      oldDocument.wasLoadedFromLocalStorage &&
      !document.wasLoadedFromLocalStorage
    ) {
      actions.dismissNotification()
    }

    // If the user has attempted to save the document, we must fire the
    // `saveDocument` action.
    if (isSaving) {
      const {validationErrors} = document
      const hasValidationErrors =
        validationErrors &&
        Object.keys(validationErrors).some(key => validationErrors[key])
      const asDuplicate =
        document.lastSaveMode === Constants.SAVE_ACTION_SAVE_AS_DUPLICATE

      // Aborting the save operation if there are any validation errors.
      if (hasValidationErrors) {
        return
      }

      return actions.saveDocument({
        collection,
        contentKey,
        documentId: asDuplicate ? null : documentId
      })
    }
  }

  componentWillReceiveProps(newProps) {
    const {actions, document, isSingleDocument, onBuildBaseUrl} = this.props
    const {document: newDocument, documentId, route} = newProps
    const {section} = route.params

    if (document.isSaving && !newDocument.isSaving) {
      const {lastSaveMode: mode} = newDocument

      switch (mode) {
        case Constants.SAVE_ACTION_SAVE_AND_GO_BACK:
          this.redirectUrl = onBuildBaseUrl.call(this, {
            documentId: null
          })

          break

        case Constants.SAVE_ACTION_SAVE_AND_CREATE_NEW:
          this.redirectUrl = onBuildBaseUrl.call(this, {
            createNew: true,
            documentId: null,
            section
          })

          break

        case Constants.SAVE_ACTION_SAVE_AS_DUPLICATE:
          this.redirectUrl = onBuildBaseUrl.call(this, {
            documentId: newDocument.remote._id
          })

          break

        default:
          // If we've just created a new document, we redirect to its new URL.
          if (!document.remote && newDocument.remote && !isSingleDocument) {
            this.redirectUrl = onBuildBaseUrl.call(this, {
              documentId: newDocument.remote._id
            })
          }
      }

      const isUpdate =
        documentId && mode !== Constants.SAVE_ACTION_SAVE_AS_DUPLICATE
      const operation = isUpdate ? 'updated' : 'created'
      const message = newDocument.remoteError
        ? `An error has occurred. The document could not be ${operation}`
        : `The document has been ${operation} successfully`

      actions.setNotification({
        message,
        type: newDocument.remoteError ? 'negative' : 'positive'
      })
    }
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.userClosingBrowser)

    this.saveDocumentLocally()
  }

  groupFieldsIntoPlacements(fields) {
    const placements = {
      main: [],
      sidebar: []
    }

    fields.forEach(field => {
      // Unless the Publish block specifically states that the field should be
      // placed on the sidebar, we stick it in the main placement.
      const placement =
        field.publish && field.publish.placement === 'sidebar'
          ? placements.sidebar
          : placements.main

      placement.push(field)
    })

    return placements
  }

  // Groups fields by section based on the `section` property of the `publish`
  // block present in their schema. It returns an array with objects containing
  // the following properties:
  //
  // - `fields`: array containing the schema of the fields in the section
  // - `isActive`: Boolean indicating whether the section is the one currently
  //      active.
  // - `name`: name of the section
  // - `slug`: slug of the section
  groupFieldsIntoSections(fields) {
    const {isNewDocument, onBuildBaseUrl, route} = this.props
    const {section: activeSectionSlug} = route.params

    const sections = {}

    Object.keys(fields).forEach(fieldSlug => {
      const field = Object.assign({}, fields[fieldSlug], {
        _id: fieldSlug
      })
      const section = (field.publish && field.publish.section) || 'Other'

      sections[section] = sections[section] || []
      sections[section].push(field)
    })

    if (Object.keys(sections).length === 0) {
      return null
    }

    // Converting sections to an array, adding a slug to each section.
    const sectionsArray = Object.keys(sections).map((sectionName, index) => {
      const fields = sections[sectionName]
      const slug = slugify(sectionName)

      // We mark this as the currently active section if there is a section
      // in the URL and this is the one that matches it, or there isn't one
      // in the URL and this is the first one.
      const isActive =
        activeSectionSlug && activeSectionSlug.length
          ? activeSectionSlug === slug
          : index === 0

      // Takes the fields and groups them into a `main` and `sidebar` arrays.
      const fieldsInPlacements = this.groupFieldsIntoPlacements(fields)

      return {
        fields: fieldsInPlacements,
        href: onBuildBaseUrl.call(this, {
          createNew: isNewDocument,
          section: slug
        }),
        isActive,
        name: sectionName,
        slug
      }
    })

    return sectionsArray
  }

  handleDocumentNotFound() {
    const {onBuildBaseUrl} = this.props
    const listRoute = onBuildBaseUrl.call(this, {
      documentId: null
    })

    return (
      <ErrorMessage
        data={{href: listRoute}}
        type={Constants.ERROR_DOCUMENT_NOT_FOUND}
      />
    )
  }

  handleNetworkError() {
    const {actions, contentKey} = this.props

    return (
      <ErrorMessage
        data={{
          onClick: () => actions.touchDocument({contentKey})
        }}
        type={Constants.STATUS_FAILED}
      />
    )
  }

  handleUserClosingBrowser() {
    this.saveDocumentLocally()
  }

  cancelReferenceSelection() {
    this.setState({referenceFieldSelected: null})
  }

  saveReferenceSelection(selection) {
    const {actions, contentKey} = this.props
    const {referenceFieldSelected} = this.state

    actions.updateLocalDocument({
      contentKey,
      update: {
        [referenceFieldSelected]:
          selection && selection.length > 0 ? selection : null
      },
      error: {
        [referenceFieldSelected]: undefined
      }
    })

    this.setState({referenceFieldSelected: null})
  }

  render() {
    if (this.redirectUrl) {
      const redirectUrl = this.redirectUrl

      this.redirectUrl = undefined

      return <Redirect to={redirectUrl} />
    }

    const {
      actions,
      collection,
      contentKey,
      document,
      documentId,
      isSingleDocument,
      onBuildBaseUrl,
      section
    } = this.props

    if (!collection) {
      return <ErrorView type={Constants.ERROR_ROUTE_NOT_FOUND} />
    }

    if (document.isDeleted) {
      actions.setNotification({
        message: 'The document has been deleted'
      })

      const redirectUrl = onBuildBaseUrl.call(this, {
        documentId: null
      })

      return <Redirect to={redirectUrl} />
    }

    // Getting the fields that are visible in the edit view.
    const collectionFields = getVisibleFields({
      fields: collection.fields,
      viewType: 'edit'
    })

    // Splitting fields into sections, as per their settings in the `publish`
    // block.
    const sections = this.groupFieldsIntoSections(collectionFields)

    // Finding a section that matches the `section` URL parameter.
    const activeSection = sections.find(({isActive}) => isActive)

    // If the section isn't valid, we redirect to the first one that is.
    if (!activeSection) {
      const {slug: firstSection} = sections[0]
      const redirectUrl = onBuildBaseUrl.call(this, {
        section: firstSection
      })

      return <Redirect to={redirectUrl} />
    }

    setPageTitle(`${documentId ? 'Edit' : 'New'} document`)

    const {referenceFieldSelected} = this.state

    if (referenceFieldSelected) {
      const merged = {...document.remote, ...document.local}
      const selection = merged[referenceFieldSelected] || []
      const normalizedSelection = Array.isArray(selection)
        ? selection
        : [selection]

      return (
        <ReferenceSelectView
          buildUrl={onBuildBaseUrl.bind(this)}
          collection={collection}
          initialSelection={normalizedSelection}
          referenceFieldName={referenceFieldSelected}
          onCancel={this.cancelReferenceSelection}
          onSave={this.saveReferenceSelection}
        />
      )
    }

    return (
      <>
        <Header />

        <div className={styles.toolbar}>
          <NotificationCentre />

          <DocumentEditToolbar
            collection={collection}
            contentKey={contentKey}
            documentId={documentId}
            isSingleDocument={isSingleDocument}
            multiLanguage={!collection.IS_MEDIA_BUCKET}
            onBuildBaseUrl={onBuildBaseUrl.bind(this)}
            section={section}
          />
        </div>

        <main className={styles.main}>
          <Document
            collection={collection}
            contentKey={contentKey}
            documentId={documentId}
            onDocumentNotFound={this.handleDocumentNotFound.bind(this)}
            onNetworkError={this.handleNetworkError.bind(this)}
            onRender={({document}) =>
              this.renderDocument({
                collection,
                contentKey,
                document,
                sections
              })
            }
            section={section}
          />
        </main>
      </>
    )
  }

  renderDocument({collection, contentKey, document, sections}) {
    const {onBuildBaseUrl, state} = this.props
    const validationErrors = document.validationErrors || {}

    if (collection.IS_MEDIA_BUCKET) {
      return this.renderMediaDocument({
        contentKey,
        document,
        sections
      })
    }

    const getFieldComponent = field => (
      <DocumentField
        collection={collection}
        contentKey={contentKey}
        document={document}
        field={field}
        key={field._id}
        onBuildBaseUrl={onBuildBaseUrl.bind(this)}
        onEditReference={() =>
          this.setState({referenceFieldSelected: field._id})
        }
      />
    )
    const fieldsWithUnsavedChanges = document.wasLoadedFromLocalStorage
      ? Object.keys(document.local).filter(
          fieldName => document.local[fieldName] !== undefined
        )
      : []

    return (
      <EditInterface>
        {sections.map(item => {
          const hasErrors =
            item.fields.main.some(field => validationErrors[field._id]) ||
            item.fields.sidebar.some(field => validationErrors[field._id])
          const hasUnsavedChanges =
            item.fields.main.some(field =>
              fieldsWithUnsavedChanges.includes(field._id)
            ) ||
            item.fields.sidebar.some(field =>
              fieldsWithUnsavedChanges.includes(field._id)
            )

          return (
            <EditInterfaceSection
              hasErrors={hasErrors}
              hasUnsavedChanges={hasUnsavedChanges}
              href={item.href}
              key={item.href}
              isActive={item.isActive}
              label={item.name}
              main={item.fields.main.map(getFieldComponent)}
              sidebar={item.fields.sidebar.map(getFieldComponent)}
              slug={item.slug}
            />
          )
        })}
      </EditInterface>
    )
  }

  renderMediaDocument({contentKey, document, sections}) {
    const {onBuildBaseUrl, state} = this.props
    const collection = Constants.MEDIA_COLLECTION_SCHEMA
    const [mainSection] = sections
    const mainSectionFields = mainSection.fields.main.concat(
      mainSection.fields.sidebar
    )

    const getFieldComponent = field => (
      <DocumentField
        collection={collection}
        contentKey={contentKey}
        document={document}
        field={field}
        key={field._id}
        onBuildBaseUrl={onBuildBaseUrl.bind(this)}
        onEditReference={() =>
          this.setState({referenceFieldSelected: field._id})
        }
      />
    )

    return (
      <EditInterface>
        <EditInterfaceSection
          hasErrors={mainSection.hasErrors}
          href={mainSection.href}
          key={mainSection.href}
          isActive={mainSection.isActive}
          label={mainSection.name}
          main={
            <MediaViewer
              config={state.app.config}
              document={document._merged}
            />
          }
          sidebar={mainSectionFields.map(getFieldComponent)}
          slug={mainSection.slug}
        />

        {sections.slice(1).map(item => (
          <EditInterfaceSection
            hasErrors={item.hasErrors}
            href={item.href}
            key={item.href}
            isActive={item.isActive}
            label={item.name}
            main={item.fields.main.map(getFieldComponent)}
            sidebar={item.fields.sidebar.map(getFieldComponent)}
            slug={item.slug}
          />
        ))}
      </EditInterface>
    )
  }

  saveDocumentLocally() {
    const {actions, contentKey} = this.props

    actions.saveDocumentLocally({
      contentKey
    })
  }
}

function mapState(state, ownProps) {
  const {
    isSingleDocument,
    route: {params}
  } = ownProps

  const documentId = isSingleDocument ? ownProps.documentId : params.documentId
  const collection =
    params.collection === Constants.MEDIA_COLLECTION_SCHEMA.slug
      ? Constants.MEDIA_COLLECTION_SCHEMA
      : state.app.config.api.collections.find(collection => {
          return collection.slug === params.collection
        })
  const contentKey = isSingleDocument
    ? JSON.stringify({collection: collection && collection.slug})
    : JSON.stringify({
        collection: collection && collection.slug,
        documentId
      })
  const document = state.document[contentKey] || {}

  return {
    collection,
    contentKey,
    document,
    documentId,
    state
  }
}

export default connectRedux(mapState, appActions, documentActions)(
  DocumentEditView
)
