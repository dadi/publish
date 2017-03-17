import {h, Component} from 'preact'
import {connect} from 'preact-redux'
import {route} from 'preact-router'
import {bindActionCreators} from 'redux'

import {buildUrl} from 'lib/router'
import Style from 'lib/Style'
import styles from './DocumentEdit.css'

import {connectHelper, setPageTitle, slugify} from 'lib/util'
import * as Constants from 'lib/constants'
import APIBridge from 'lib/api-bridge-client'
import {getCurrentApi, getCurrentCollection} from 'lib/app-config'

import Button from 'components/Button/Button'
import ButtonWithOptions from 'components/ButtonWithOptions/ButtonWithOptions'
import FieldBoolean from 'components/FieldBoolean/FieldBoolean'
import FieldImage from 'components/FieldImage/FieldImage'
import FieldString from 'components/FieldString/FieldString'
import Main from 'components/Main/Main'
import Nav from 'components/Nav/Nav'
import SubNavItem from 'components/SubNavItem/SubNavItem'
import Toolbar from 'components/Toolbar/Toolbar'

import * as apiActions from 'actions/apiActions'
import * as documentActions from 'actions/documentActions'

class DocumentEdit extends Component {
  constructor(props) {
    super(props)

    this.state.hasTriedSubmitting = false
  }

  render() {
    const {
      collection,
      documentId,
      group,
      method,
      state
    } = this.props

    const currentCollection = getCurrentCollection(state.api.apis, group, collection)
    const document = state.document

    if (document.remoteStatus === Constants.STATUS_LOADING || !currentCollection || !document.local) {
      return null
    }

    const fields = this.groupFields(currentCollection.fields)
    const sections = fields.sections || [{
      slug: 'other',
      fields: fields.other
    }]
    const activeSection = this.props.section || sections[0].slug

    const hasValidationErrors = Object.keys(document.validationErrors).filter(field => {
      return document.validationErrors[field]
    }).length

    return (
      <div class={styles.container}>
        {fields.sections &&
          <div class={styles.navigation}>
            {fields.sections.map(collectionSection => {
              return (
                <SubNavItem
                  active={activeSection === collectionSection.slug}
                  error={collectionSection.hasErrors}
                  href={buildUrl(group, collection, 'document/edit', documentId, collectionSection.slug)}
                >
                  {collectionSection.name}
                </SubNavItem>
              )
            })}
          </div>
        }

        {sections.map(section => {
          let sectionClass = new Style(styles, 'section')

          sectionClass.addIf('section-active', section.slug === activeSection)

          const mainBodyFields = section.fields.filter(field => {
            const position = field.publish && field.publish.position

            return !position || position === 'main'
          })

          const sideBarFields = section.fields.filter(field => {
            const position = field.publish && field.publish.position

            return position === 'sidebar'
          })

          const mainBodyStyle = new Style(styles, 'main')

          // If there are no fields in the side bar, the main body can use
          // the full width of the page.
          mainBodyStyle.addIf('main-full', !sideBarFields.length)

          return (
            <section class={sectionClass.getClasses()}>
              <div class={mainBodyStyle.getClasses()}>
                {mainBodyFields.map(field => this.renderField(field))}
              </div>

              {(sideBarFields.length > 0) &&
                <div class={styles.sidebar}>
                  {sideBarFields.map(field => this.renderField(field))}
                </div>
              }
            </section>
          )
        })}

        <Toolbar>
          <div>
            <Button
              accent="destruct"
            >Delete</Button>
          </div>

          <div>
            <ButtonWithOptions
              accent="save"
              disabled={hasValidationErrors}
              onClick={this.handleSave.bind(this)}
              options={{
                'Save and create new': (() => {}),
                'Save and go back': (() => {}),
                'Save and duplicate': (() => {})
              }}
            >
              Save and continue
            </ButtonWithOptions>
          </div>
        </Toolbar>
      </div>
    )
  }

  shouldComponentUpdate(nextProps, nextState) {
    const {
      section,
      state,
      group,
      collection,
      documentId
    } = this.props

    const currentCollection = getCurrentCollection(state.api.apis, group, collection)

    if (currentCollection) {
      const fields = this.groupFields(currentCollection.fields)

      if (section) {
        const sectionMatch = fields.sections.find(fieldSection => {
          return fieldSection.slug === section
        })

        if (!sectionMatch) {
          const firstSection = fields.sections[0]
          route(buildUrl(group, currentCollection.name, 'document/edit', documentId, firstSection.slug))

          return false
        }
      }
    }
  }

  componentDidUpdate(previousProps) {
    const {documentId, state} = this.props
    const document = state.document
    const documentIdHasChanged = documentId !== previousProps.documentId

    // We fetch a new document if:
    //
    // - We're not already in the process of fetching one AND
    // - There is no document in the store OR the document id has changed AND
    // - All APIs have collections
    const notLoading = document.remoteStatus !== Constants.STATUS_LOADING
    const needsFetch = !document.remote || documentIdHasChanged
    const allApisHaveCollections = state.api.apis.filter(api => !api.collections).length === 0

    if (notLoading && needsFetch && allApisHaveCollections) {
      this.getDocument(documentId)
    }
  }

  componentWillUnmount() {
    const {actions} = this.props

    actions.clearRemoteDocument()
  }

  // Handles the callback that fires whenever a field changes and the new value is ready
  // to be sent to the store
  handleFieldChange(fieldName, value) {
    const {actions} = this.props

    actions.updateLocalDocument({
      [fieldName]: value
    })
  }

  // Handles the callback that fires whenever there's a new validation error in a field or
  // when a validation error has been cleared
  handleFieldError(fieldName, hasError, value) {
    const {actions} = this.props

    actions.setFieldErrorStatus(fieldName, value, hasError)
  }

  // Handles the save operation
  handleSave() {
    this.setState({
      hasTriedSubmitting: true
    })
  }

  // Fetches a document from the remote API
  getDocument(documentId) {
    const {actions, collection, group, state} = this.props
    const currentApi = getCurrentApi(state.api.apis, group, collection)
    const currentCollection = getCurrentCollection(state.api.apis, group, collection)

    actions.setRemoteDocumentStatus(Constants.STATUS_LOADING)

    return APIBridge(currentApi)
      .in(currentCollection.name)
      .whereFieldIsEqualTo('_id', documentId)
      .find()
      .then(response => {
        if (!response.results.length) return

        const document = response.results[0]

        actions.setRemoteDocument(document)

        // This is something to revisit. We don't have the concept of a primary field,
        // which we would use for, among other things, set the title of the page when
        // editing a document. For now, and to be consistent with how we're linking to
        // documents in the document list view, we take the contents of the first field
        // (which technically is the second, since the first one is always _id).
        const firstField = Object.keys(document)[1]

        setPageTitle(document[firstField])
      })
  }

  // Groups fields by section
  groupFields(fields) {
    const document = this.props.state.document

    let sections = {}
    let sectionsArray = null
    let other = []

    Object.keys(fields).forEach(fieldSlug => {
      let field = Object.assign({}, fields[fieldSlug], {
        _id: fieldSlug
      })
      let section = field.publish && field.publish.section

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
        const sectionHasErrors = fields.some(field => document.validationErrors[field._id])

        let section = {
          fields,
          hasErrors: sectionHasErrors,
          name: sectionName,
          slug: slugify(sectionName)
        }

        return section
      })
    }

    return {
      sections: sectionsArray,
      other
    }
  }

  // Renders a field, deciding which component to use based on the field type
  renderField(field) {
    const {document} = this.props.state
    const hasError = document.validationErrors[field._id]
    const {hasTriedSubmitting} = this.state

    let fieldElement = null

    switch (field.type) {
      case 'Boolean':
        fieldElement = (
          <FieldBoolean
            error={hasError}
            forceValidation={hasTriedSubmitting}
            onChange={this.handleFieldChange.bind(this)}
            onError={this.handleFieldError.bind(this)}
            value={document.local[field._id]}
            schema={field}
          />
        )

        break

      case 'String':
        fieldElement = (
          <FieldString
            error={hasError}
            forceValidation={hasTriedSubmitting}
            onChange={this.handleFieldChange.bind(this)}
            onError={this.handleFieldError.bind(this)}
            value={document.local[field._id]}
            schema={field}
          />
        )

        break
    }

    return fieldElement ? <div class={styles.field}>{fieldElement}</div> : null
  }
}

export default connectHelper(
  state => state,
  dispatch => bindActionCreators({...documentActions, ...apiActions}, dispatch)
)(DocumentEdit)
