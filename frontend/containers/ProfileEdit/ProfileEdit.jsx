'use strict'

import {Component, h} from 'preact'
import proptypes from 'proptypes'

import * as Constants from 'lib/constants'
import * as userActions from 'actions/userActions'
import {connectHelper} from 'lib/util'
import {bindActionCreators} from 'redux'

import Style from 'lib/Style'
import styles from './ProfileEdit.css'

import {edit as FieldPassword} from 'frontend/components/FieldPassword/FieldPassword'
import {edit as FieldString} from 'frontend/components/FieldString/FieldString'

import Header from 'containers/Header/Header'
import Main from 'components/Main/Main'
import Page from 'components/Page/Page'
import ProfileEditToolbar from 'containers/ProfileEditToolbar/ProfileEditToolbar'
import TabbedFieldSections from 'components/TabbedFieldSections/TabbedFieldSections'

/**
 * The interface for editing a user profile.
 */
class ProfileEdit extends Component {
  static propTypes = {
    /**
    * A callback to be used to obtain the base URL for the given page, as
    * determined by the view.
    */
    onBuildBaseUrl: proptypes.func,

    /**
     * The name of a reference field currently being edited.
     */
    referencedField: proptypes.string,

    /**
     * The current active section (if any).
     */
    section: proptypes.string,

    /**
     * All available sections.
     */
    sections: proptypes.array
  }

  // Handles the callback that fires whenever a field changes and the new value
  // is ready to be sent to the store.
  handleFieldChange(fieldName, value) {
    const {
      actions
    } = this.props

    actions.updateLocalUser(fieldName, value)
  }

  // Handles the callback that fires whenever there's a new validation error
  // in a field or when a validation error has been cleared.
  handleFieldError(fieldName, hasError, value) {
    const {actions} = this.props

    actions.setFieldErrorStatus(fieldName, value, hasError)
  }

  render() {
    const {
      onBuildBaseUrl,
      referencedField,
      section,
      state
    } = this.props

    let sections = [
      {
        name: 'Credentials',
        slug: 'credentials',
        fields: [
          'clientId',
          'secret'
        ]
      },
      {
        name: 'Personal details',
        slug: 'personal-details',
        fields: [
          'data.publishFirstName',
          'data.publishLastName'
        ]
      }
    ]

    // Add a link to each section.
    sections.forEach(section => {
      section.href = `/profile/${section.slug}`
    })

    return (
      <Page>
        <Header />

        <Main>
          <ProfileEditToolbar />

          <TabbedFieldSections
            activeSection={section}
            renderField={this.renderField.bind(this)}
            sections={sections}
          />
        </Main>
      </Page>
    )
  }

  renderField(field) {
    const {
      state
    } = this.props

    let hasError = state.validationErrors
      && state.validationErrors[field]
    let error = typeof hasError === 'string'
      ? 'This field ' + hasError
      : hasError
    let schema = {
      _id: field
    }
    let userData = {
      ...state.remote.data,
      ...state.local.data
    }

    if (field === 'clientId') {
      return (
        <FieldString
          displayName="Username"
          error={error}
          name="clientId"
          onChange={this.handleFieldChange.bind(this)}
          onError={this.handleFieldError.bind(this)}
          schema={{
            ...schema,
            publish: {
              readonly: true
            }
          }}
          value={state.remote.clientId}
        />
      )
    }

    if (field === 'secret') {
      return (
        <FieldPassword
          displayName="Password"
          error={error}
          name="secret"
          onChange={this.handleFieldChange.bind(this)}
          onError={this.handleFieldError.bind(this)}
          schema={schema}
        />
      )
    }

    if (field === 'data.publishFirstName') {
      return (
        <FieldString
          displayName="First name"
          error={error}
          name="data.publishFirstName"
          onChange={this.handleFieldChange.bind(this)}
          onError={this.handleFieldError.bind(this)}
          schema={schema}
          value={userData.publishFirstName}
        />
      )
    }

    if (field === 'data.publishLastName') {
      return (
        <FieldString
          displayName="Last name"
          error={error}
          name="data.publishLastName"
          onChange={this.handleFieldChange.bind(this)}
          onError={this.handleFieldError.bind(this)}
          schema={schema}
          value={userData.publishLastName}
        />
      )
    }
  }
}

export default connectHelper(
  state => state.user,
  dispatch => bindActionCreators(userActions, dispatch)
)(ProfileEdit)