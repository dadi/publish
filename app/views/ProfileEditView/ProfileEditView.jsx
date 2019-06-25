import * as appActions from 'actions/appActions'
import * as userActions from 'actions/userActions'
import {connectRedux} from 'lib/redux'
import EditInterface from 'components/EditInterface/EditInterface'
import EditInterfaceSection from 'components/EditInterface/EditInterfaceSection'
import Header from 'containers/Header/Header'
import Main from 'components/Main/Main'
import Page from 'components/Page/Page'
import ProfileEditToolbar from 'containers/ProfileEditToolbar/ProfileEditToolbar'
import ProfileField from 'containers/ProfileField/ProfileField'
import React from 'react'
import {Redirect} from 'react-router-dom'
import {setPageTitle} from 'lib/util'
import {slugify} from 'shared/lib/string'
import styles from './ProfileEditView.css'

const PROFILE_SCHEMA = {
  _publishLink: '/profile',
  fields: {
    'data.publishFirstName': {
      label: 'First name',
      type: 'String',
      publish: {
        section: 'Personal details'
      }
    },
    'data.publishLastName': {
      label: 'Last name',
      type: 'String',
      publish: {
        section: 'Personal details'
      }
    },
    currentSecret: {
      label: 'Current password',
      publish: {
        section: 'Credentials',
        subType: 'Password'
      },
      type: 'String'
    },
    secret: {
      label: 'New password',
      publish: {
        requireConfirmation: true,
        section: 'Credentials',
        subType: 'Password'
      },
      type: 'String'
    }
  },
  name: 'Profile',
  slug: 'profile'
}

class ProfileEditView extends React.Component {
  constructor(props) {
    super(props)

    this.contentKey = 'profile'
  }

  componentDidUpdate(oldProps) {
    const {actions, state} = this.props
    const {user} = state
    const {user: oldUser} = oldProps.state

    if (oldUser.saveAttempts < user.saveAttempts) {
      return actions.saveUser()
    }

    if (oldUser.isSaving && !user.isSaving) {
      const message = user.remoteError
        ? 'Could not update your settings'
        : 'Your settings have been updated'

      return actions.setNotification({
        message
      })
    }
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
  // - `hasErrors`: Boolean indicating whether there are fields with errors
  //      in the section
  // - `isActive`: Boolean indicating whether the section is the one currently
  //      active.
  // - `name`: name of the section
  // - `slug`: slug of the section
  groupFieldsIntoSections({fields, validationErrors = {}}) {
    const {route} = this.props
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
      const sectionHasErrors = fields.some(field => validationErrors[field._id])
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
        hasErrors: sectionHasErrors,
        href: this.handleBuildBaseUrl({
          section: slug
        }),
        isActive,
        name: sectionName,
        slug
      }
    })

    return sectionsArray
  }

  handleBuildBaseUrl({
    referenceFieldSelect = this.props.route.params.referenceField,
    section = this.props.route.params.section
  }) {
    let urlNodes = ['profile', section]

    if (referenceFieldSelect) {
      urlNodes = urlNodes.concat(['select', referenceFieldSelect])
    }

    const url = urlNodes.filter(Boolean).join('/')

    return `/${url}`
  }

  render() {
    // Splitting fields into sections, as per their settings in the `publish`
    // block.
    const sections = this.groupFieldsIntoSections({
      fields: PROFILE_SCHEMA.fields
    })

    // Finding a section that matches the `section` URL parameter.
    const activeSection = sections.find(({isActive}) => isActive)

    // If the section isn't valid, we redirect to the first one that is.
    if (!activeSection) {
      const {slug: firstSection} = sections[0]
      const redirectUrl = this.props.onBuildBaseUrl.call(this, {
        section: firstSection
      })

      return <Redirect to={redirectUrl} />
    }

    setPageTitle('Profile')

    return (
      <Page>
        <Header />

        <div className={styles.toolbar}>
          <ProfileEditToolbar />
        </div>

        <Main>{this.renderFields({sections})}</Main>
      </Page>
    )
  }

  renderFields({sections}) {
    return (
      <EditInterface>
        {sections.map(item => (
          <EditInterfaceSection
            hasErrors={item.hasErrors}
            href={item.href}
            key={item.href}
            isActive={item.isActive}
            label={item.name}
            main={item.fields.main.map(field => (
              <ProfileField
                field={field}
                key={field._id}
                onBuildBaseUrl={this.handleBuildBaseUrl.bind(this)}
              />
            ))}
            sidebar={item.fields.sidebar.map(field => (
              <ProfileField
                field={field}
                key={field._id}
                onBuildBaseUrl={this.handleBuildBaseUrl.bind(this)}
              />
            ))}
            slug={item.slug}
          />
        ))}
      </EditInterface>
    )
  }
}

export default connectRedux(appActions, userActions)(ProfileEditView)
