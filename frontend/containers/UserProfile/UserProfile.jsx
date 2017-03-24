'use strict'

import {Component, h} from 'preact'
import proptypes from 'proptypes'
import {connect} from 'preact-redux'
import {bindActionCreators} from 'redux'
import {route} from 'preact-router'

import Style from 'lib/Style'
import styles from './UserProfile.css'

import {Case, connectHelper, setPageTitle} from 'lib/util'
import {getAuthCollection} from 'lib/app-config'
import {buildUrl} from 'lib/router'

import * as userActions from 'actions/userActions'

import SubNavItem from 'components/SubNavItem/SubNavItem'

/**
 * The interface for editing a user profile.
 */
class UserProfile extends Component {

  static propTypes = {

    /**
     * The current active section (if any).
     */
    section: proptypes.string,
    /**
     * The current active section (if any).
     */
    sections: proptypes.array
  }

  static defaultProps = {
    sections: ['account', 'settings', 'security']
  }

  componentDidUpdate(previousProps) {
    const {
      actions,
      section,
      state,
      sections,
    } = this.props


    if (state.app.config) {
      const auth = state.app.config.auth

      const currentCollection = getAuthCollection(state.api.apis, auth)

      if (currentCollection) {
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
    const {sections, section} = this.props

    return (
      <div class={styles.container}>
        <div class={styles.navigation}>
          {sections.map(userSection => {
            let isActive = userSection === section

            return (
              <SubNavItem
                active={isActive}
                href={buildUrl('profile', userSection)}
              >
                {userSection}
              </SubNavItem>
            )
          })}
        </div>
      </div>
    )
  }
}

export default connectHelper(
  state => state,
  dispatch => bindActionCreators(userActions, dispatch)
)(UserProfile)
