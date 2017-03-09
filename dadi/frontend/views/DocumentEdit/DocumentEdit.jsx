import {h, Component} from 'preact'
import {connect} from 'preact-redux'
import {route} from 'preact-router'
import {bindActionCreators} from 'redux'

import Style from 'lib/Style'
import styles from './DocumentEdit.css'

import {connectHelper, slugify} from 'lib/util'
import * as Constants from 'lib/constants'
import APIBridge from 'lib/api-bridge-client'

import FieldImage from 'components/FieldImage/FieldImage'
import Main from 'components/Main/Main'
import Nav from 'components/Nav/Nav'
import SubNavItem from 'components/SubNavItem/SubNavItem'

import * as apiActions from 'actions/apiActions'
import * as documentActions from 'actions/documentActions'

class DocumentEdit extends Component {
  constructor(props) {
    super(props)
  }

  getUrlTo(group, collection, documentId, section) {
    let url = group ? `/${group}` : ''

    url += `/${collection}/document/edit/${documentId}`
    url += section ? `/${section}` : ''

    return url
  }
  
  render() {
    const {
      collection,
      documentId,
      group,
      method,
      section,
      state
    } = this.props
    const currentCollection = state.api.currentCollection
    const document = state.document

    if ((document.status === Constants.STATUS_LOADING || !currentCollection)) {
      return (
        <p>Loading...</p>
      )
    }

    const fields = this.groupFields(currentCollection.fields)

    if (fields.sections) {
      const currentSection = fields.sections.find(fieldSection => {
        return fieldSection.slug === section
      })

      // If we have sections and we're tring to access the URL with no section OR we're
      // trying to access an invalid section, we redirect to the first availabla section.
      if (!currentSection) {
        const firstSection = fields.sections[0]

        route(this.getUrlTo(group, collection, documentId, firstSection.slug))

        return null
      }
    }

    return (
      <div>
        {fields.sections &&
          <section class={styles.navigation}>
            {fields.sections.map(collectionSection => {

              return (
                <SubNavItem
                  active={section === collectionSection.slug}
                  href={this.getUrlTo(group, collection, documentId, collectionSection.slug)}
                >
                  {collectionSection.name}
                </SubNavItem>
              )
            })}
          </section>
        }

        <section class={styles.content}>
          <div class={styles.main}>
            <p>Main</p>
          </div>
          <div class={styles.sidebar}>
            <p>Side bar</p>
          </div>
        </section>
      </div>
    )
  }

  componentDidUpdate(previousProps) {
    const {documentId, state} = this.props
    const document = state.document
    const documentIdHasChanged = documentId !== previousProps.documentId

    // If we haven't already started fetching a document and there isn't a document already in
    // the store or we need to get a new one because the id has changed, let's get a document
    if ((document.status !== Constants.STATUS_LOADING) && (!document.data || documentIdHasChanged)) {
      this.getDocument(documentId)
    }
  }

  componentWillUnmount() {
    const {actions} = this.props

    actions.clearDocument()
  }

  getDocument(documentId) {
    const {actions, collection, state} = this.props

    actions.setDocumentStatus(Constants.STATUS_LOADING)
    
    return APIBridge(state.api.apis[0])
      .in(collection)
      .whereFieldIsEqualTo('_id', documentId)
      .find()
      .then(doc => {
        actions.setDocument(doc.results[0], collection)
      })
  }

  groupFields(fields) {
    let sections = {}
    let sectionsArray = null
    let other = []

    Object.keys(fields).forEach(fieldSlug => {
      let field = fields[fieldSlug]
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
        return {
          slug: slugify(sectionName),
          name: sectionName,
          fields: sections[sectionName]
        }
      })
    }

    return {
      sections: sectionsArray,
      other
    }
  }
}

export default connectHelper(
  state => state,
  dispatch => bindActionCreators({...documentActions, ...apiActions}, dispatch)
)(DocumentEdit)
