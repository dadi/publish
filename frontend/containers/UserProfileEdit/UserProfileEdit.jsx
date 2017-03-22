'use strict'

import {h, Component} from 'preact'
import {connect} from 'preact-redux'
import {bindActionCreators} from 'redux'
import {route} from 'preact-router'

import {connectHelper, setPageTitle, Case} from 'lib/util'
import {getAuthCollection} from 'lib/app-config'
import {buildUrl} from 'lib/router'

import * as userActions from 'actions/userActions'

/**
 * The interface for editing a user profile.
 */
class UserProfileEdit extends Component {

  componentDidUpdate(previousProps) {
    const {
      actions,
      section,
      state
    } = this.props

    const sections = ['account', 'settings', 'password_reset']

    if (state.app.config) {
      const auth = state.app.config.auth

      const currentCollection = getAuthCollection(state.api.apis, auth)

      if (currentCollection) {
        const fields = Object.keys(currentCollection.fields)
        const firstField = Object.keys(currentCollection.fields).find(field => (currentCollection.fields[field].publish && currentCollection.fields[field].publish.section))
        const firstSection = firstField.length ? currentCollection.fields[firstField].publish.section.toLowerCase() : sections[0]

        const sectionMatch = section ? sections.find(fieldSection => fieldSection === section) : null
        if (!section || !sectionMatch) {
          route(buildUrl('profile', firstSection))
          
          return false
        }
        setPageTitle(`Edit Profile ${Case.sentence(section)}`)
      }
    }
  }

  render() {
    return (
      <h1>PROFILES</h1> 
    )
  }
}

export default connectHelper(
  state => state,
  dispatch => bindActionCreators(userActions, dispatch)
)(UserProfileEdit)
