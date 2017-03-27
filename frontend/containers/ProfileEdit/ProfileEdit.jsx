'use strict'

import {Component, h} from 'preact'
import proptypes from 'proptypes'
import {connect} from 'preact-redux'
import {bindActionCreators} from 'redux'
import {route} from 'preact-router'

import Style from 'lib/Style'
import styles from './ProfileEdit.css'

import {Case, connectHelper} from 'lib/util'
import {getAuthCollection} from 'lib/app-config'
import {buildUrl} from 'lib/router'

import * as userActions from 'actions/userActions'

import SubNavItem from 'components/SubNavItem/SubNavItem'

/**
 * The interface for editing a user profile.
 */
class ProfileEdit extends Component {

  static propTypes = {

    /**
    * A callback to be fired if the container wants to attempt changing the
    * page title.
    */
    onPageTitle: proptypes.func,

    /**
     * The current active section (if any).
     */
    section: proptypes.string,

    /**
     * All available sections.
     */
    sections: proptypes.array
  }

  static defaultProps = {
    sections: [
      {
        slug: 'account',
        value: 'Account'
      },
      {
        slug: 'settings',
        value: 'Settings'
      },
      {
        slug: 'security',
        value: 'Security'
      }
    ]
  }

  componentDidUpdate(previousProps) {
    const {section, onPageTitle} = this.props

    onPageTitle(`Edit Profile ${Case.sentence(section)}`)
  }

  shouldComponentUpdate(nextProps, nextState) {
    const {
      section,
      state,
      sections,
    } = this.props


    if (state.app.config) {
      const auth = state.app.config.auth
      const currentCollection = getAuthCollection(state.api.apis, auth)

      if (currentCollection) {
        const firstField = Object.keys(currentCollection.fields)
          .find(field => (currentCollection.fields[field].publish && currentCollection.fields[field].publish.section))
        const firstSection = firstField.length ? currentCollection.fields[firstField].publish.section.toLowerCase() : sections[0].slug

        const sectionMatch = section ? sections.find(fieldSection => fieldSection.slug === section) : null

        if (section && !sectionMatch) {
          route(buildUrl('profile', firstSection))

          return false
        }
      }
    }
  }

  render() {
    const {sections, section} = this.props
    const activeSection = section || sections[0].slug

    return (
      <div class={styles.container}>
        <div class={styles.navigation}>
          {sections.map(userSection => {
            const isActive = userSection.slug === activeSection

            return (
              <SubNavItem
                active={isActive}
                href={buildUrl('profile', userSection.slug)}
              >
                {userSection.value}
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
)(ProfileEdit)
