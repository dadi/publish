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
import {getVisibleFields} from 'lib/fields'
import Header from 'containers/Header/Header'
import Main from 'components/Main/Main'
import MediaViewer from 'components/MediaViewer/MediaViewer'
import Page from 'components/Page/Page'
import React from 'react'
import {Redirect} from 'react-router-dom'
import {setPageTitle} from 'lib/util'
import {slugify} from 'shared/lib/string'
import styles from './DocumentEditView.css'

class DocumentEditView extends React.Component {
  constructor(props) {
    super(props)

    this.sections = []
    this.userClosingBrowser = this.handleUserClosingBrowser.bind(this)
  }

  componentDidMount() {
    const {actions, route} = this.props
    const {documentId} = route.params

    if (!documentId) {
      actions.startDocument({
        contentKey: this.contentKey
      })
    }

    window.addEventListener('beforeunload', this.userClosingBrowser)
  }

  componentDidUpdate(oldProps) {
    const {actions, route, state} = this.props
    const {state: oldState} = oldProps
    const {documentId} = route.params
    const document = state.document[this.contentKey] || {}
    const oldDocument = oldState.document[this.contentKey] || {}
    const isSaving = (oldDocument.saveAttempts || 0) < document.saveAttempts

    // Are there unsaved changes?
    if (
      document.wasLoadedFromLocalStorage &&
      !this.shownUnsavedChangesNotification
    ) {
      const notification = {
        dismissAfterSeconds: false,
        fadeAfterSeconds: 5,
        message: 'You have unsaved changes',
        options: {
          'Discard them?': actions.discardUnsavedChanges.bind(this, {
            contentKey: this.contentKey
          })
        }
      }

      actions.setNotification(notification)

      this.shownUnsavedChangesNotification = true
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
        collection: this.collection,
        contentKey: this.contentKey,
        documentId: asDuplicate ? null : documentId
      })
    }
  }

  componentWillReceiveProps(newProps) {
    const {actions, onBuildBaseUrl, state} = this.props
    const document = state.document[this.contentKey] || {}
    const {route, state: newState} = newProps
    const newDocument = newState.document[this.contentKey] || {}
    const {documentId, section} = route.params

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
          if (!document.remote && newDocument.remote) {
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
        message
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
    const {onBuildBaseUrl, route} = this.props
    const {documentId, section: activeSectionSlug} = route.params

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
          createNew: !documentId,
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
    return (
      <ErrorMessage
        data={{
          onClick: () =>
            this.props.actions.touchDocument({contentKey: this.contentKey})
        }}
        type={Constants.STATUS_FAILED}
      />
    )
  }

  handleUserClosingBrowser() {
    this.saveDocumentLocally()
  }

  render() {
    if (this.redirectUrl) {
      const redirectUrl = this.redirectUrl

      this.redirectUrl = undefined

      return <Redirect to={redirectUrl} />
    }

    const {actions, onBuildBaseUrl, route, section, state} = this.props
    const {api} = state.app.config
    const {collection: collectionName, documentId} = route.params
    const collection =
      collectionName === Constants.MEDIA_COLLECTION_SCHEMA.slug
        ? Constants.MEDIA_COLLECTION_SCHEMA
        : api.collections.find(collection => {
            return collection.slug === route.params.collection
          })

    if (!collection) {
      return (
        <Page>
          <Header />

          <Main>
            <ErrorMessage type={Constants.ERROR_ROUTE_NOT_FOUND} />
          </Main>
        </Page>
      )
    }

    // Storing the collection in an instance variable so that other lifecycle
    // methods can use it.
    this.collection = collection

    // Computing the content key and storing it in an instance variable so that
    // other lifecycle methods can use it.
    this.contentKey = JSON.stringify({
      collection: collection.slug,
      documentId
    })

    const document = state.document[this.contentKey] || {}

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

    return (
      <Page>
        <Header />

        <div className={styles.toolbar}>
          <DocumentEditToolbar
            collection={collection}
            contentKey={this.contentKey}
            documentId={documentId}
            multiLanguage={!collection.IS_MEDIA_BUCKET}
            onBuildBaseUrl={onBuildBaseUrl.bind(this)}
            section={section}
          />
        </div>

        <Main>
          <Document
            collection={collection}
            contentKey={this.contentKey}
            documentId={documentId}
            onDocumentNotFound={this.handleDocumentNotFound.bind(this)}
            onNetworkError={this.handleNetworkError.bind(this)}
            onRender={({document}) =>
              this.renderDocument({
                collection,
                contentKey: this.contentKey,
                document,
                sections
              })
            }
            section={section}
          />
        </Main>
      </Page>
    )
  }

  renderDocument({collection, contentKey, document, sections}) {
    const {onBuildBaseUrl} = this.props
    const validationErrors = document.validationErrors || {}

    if (collection.IS_MEDIA_BUCKET) {
      return this.renderMediaDocument({
        contentKey,
        document,
        sections
      })
    }

    return (
      <EditInterface>
        {sections.map(item => {
          const hasErrors =
            item.fields.main.some(field => validationErrors[field._id]) ||
            item.fields.sidebar.some(field => validationErrors[field._id])

          return (
            <EditInterfaceSection
              hasErrors={hasErrors}
              href={item.href}
              key={item.href}
              isActive={item.isActive}
              label={item.name}
              main={item.fields.main.map(field => (
                <DocumentField
                  collection={collection}
                  contentKey={contentKey}
                  document={document}
                  field={field}
                  key={field._id}
                  onBuildBaseUrl={onBuildBaseUrl.bind(this)}
                />
              ))}
              sidebar={item.fields.sidebar.map(field => (
                <DocumentField
                  collection={collection}
                  contentKey={contentKey}
                  document={document}
                  field={field}
                  key={field._id}
                  onBuildBaseUrl={onBuildBaseUrl.bind(this)}
                />
              ))}
              slug={item.slug}
            />
          )
        })}
      </EditInterface>
    )
  }

  renderMediaDocument({contentKey, document, sections}) {
    const {onBuildBaseUrl} = this.props
    const collection = Constants.MEDIA_COLLECTION_SCHEMA
    const [mainSection] = sections
    const mainSectionFields = mainSection.fields.main.concat(
      mainSection.fields.sidebar
    )

    return (
      <EditInterface>
        <EditInterfaceSection
          hasErrors={mainSection.hasErrors}
          href={mainSection.href}
          key={mainSection.href}
          isActive={mainSection.isActive}
          label={mainSection.name}
          main={<MediaViewer document={document._merged} />}
          sidebar={mainSectionFields.map(field => (
            <DocumentField
              collection={collection}
              contentKey={contentKey}
              document={document}
              field={field}
              key={field._id}
              onBuildBaseUrl={onBuildBaseUrl.bind(this)}
            />
          ))}
          slug={mainSection.slug}
        />

        {sections.slice(1).map(item => (
          <EditInterfaceSection
            hasErrors={item.hasErrors}
            href={item.href}
            key={item.href}
            isActive={item.isActive}
            label={item.name}
            main={item.fields.main.map(field => (
              <DocumentField
                collection={collection}
                contentKey={contentKey}
                document={document}
                field={field}
                key={field._id}
                onBuildBaseUrl={onBuildBaseUrl.bind(this)}
              />
            ))}
            sidebar={item.fields.sidebar.map(field => (
              <DocumentField
                collection={collection}
                contentKey={contentKey}
                document={document}
                field={field}
                key={field._id}
                onBuildBaseUrl={onBuildBaseUrl.bind(this)}
              />
            ))}
            slug={item.slug}
          />
        ))}
      </EditInterface>
    )
  }

  saveDocumentLocally() {
    const {actions} = this.props

    actions.saveDocumentLocally({
      contentKey: this.contentKey
    })
  }
}

export default connectRedux(appActions, documentActions)(DocumentEditView)
