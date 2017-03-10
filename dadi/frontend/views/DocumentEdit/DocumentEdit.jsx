import {h, Component} from 'preact'
import {connect} from 'preact-redux'
import {route} from 'preact-router'
import {bindActionCreators} from 'redux'

import Style from 'lib/Style'
import styles from './DocumentEdit.css'

import {connectHelper, setPageTitle, slugify} from 'lib/util'
import * as Constants from 'lib/constants'
import APIBridge from 'lib/api-bridge-client'

import ActionBar from 'components/ActionBar/ActionBar'
import Button from 'components/Button/Button'
import ButtonWithOptions from 'components/ButtonWithOptions/ButtonWithOptions'
import FieldImage from 'components/FieldImage/FieldImage'
import FieldString from 'components/FieldString/FieldString'
import Main from 'components/Main/Main'
import Nav from 'components/Nav/Nav'
import SubNavItem from 'components/SubNavItem/SubNavItem'

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

    const currentCollection = state.api.currentCollection
    const document = state.document

    if (document.remoteStatus === Constants.STATUS_LOADING || !currentCollection || !document.local) {
      return (
        <p>Loading...</p>
      )
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
                  href={this.getUrlTo(group, collection, documentId, collectionSection.slug)}
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

          return (
            <section class={sectionClass.getClasses()}>
              <div class={styles.main}>
                {section.fields.filter(field => {
                  const position = field.publish && field.publish.position

                  return !position || position === 'main'
                }).map(field => this.renderField(field))}
              </div>
              <div class={styles.sidebar}>
                {section.fields.filter(field => {
                  const position = field.publish && field.publish.position

                  return position === 'sidebar'
                }).map(field => this.renderField(field))}
              </div>
            </section>
          )
        })}

        <ActionBar>
          <Button
            accent="destruct"
          >
            Delete
          </Button>
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
        </ActionBar>
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

    const currentCollection = state.api.currentCollection

    if (currentCollection) {
      const fields = this.groupFields(currentCollection.fields)

      if (section) {
        const sectionMatch = fields.sections.find(fieldSection => {
          return fieldSection.slug === section
        })

        if (!sectionMatch) {
          const firstSection = fields.sections[0]

          route(this.getUrlTo(group, collection, documentId, firstSection.slug))

          return false
        }
      }
    }
  }

  componentDidUpdate(previousProps) {
    const {documentId, state} = this.props
    const document = state.document
    const documentIdHasChanged = documentId !== previousProps.documentId

    // If we haven't already started fetching a document and there isn't a document already in
    // the store or we need to get a new one because the id has changed, let's get a document
    if ((document.remoteStatus !== Constants.STATUS_LOADING) && (!document.remote || documentIdHasChanged)) {
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
    const {actions, collection, state} = this.props

    actions.setRemoteDocumentStatus(Constants.STATUS_LOADING)
    
    return APIBridge(state.api.apis[0])
      .in(collection)
      .whereFieldIsEqualTo('_id', documentId)
      .find()
      .then(response => {
        const document = response.results[0]

        actions.setRemoteDocument(document, collection)

        // This is something to revisit. We don't have the concept of a primary field,
        // which we would use for, among other things, set the title of the page when
        // editing a document. For now, and to be consistent with how we're linking to
        // documents in the document list view, we take the contents of the first field
        // (which technically is the second, since the first one is always _id).
        const firstField = Object.keys(document)[1]

        setPageTitle(document[firstField])
      })
  }

  // Constructs a URL for the given document based on the group, collection and section
  getUrlTo(group, collection, documentId, section) {
    return `${group ? `/${group}` : ''}/${collection}/document/edit/${documentId}${section ? `/${section}` : ''}`
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

    switch (field.type) {
      case 'String':
        return (
          <FieldString
            error={hasError}
            forceValidation={hasTriedSubmitting}
            onChange={this.handleFieldChange.bind(this)}
            onError={this.handleFieldError.bind(this)}
            value={document.local[field._id]}
            schema={field}
          />
        )
    }

    return null
  }
}

export default connectHelper(
  state => state,
  dispatch => bindActionCreators({...documentActions, ...apiActions}, dispatch)
)(DocumentEdit)
