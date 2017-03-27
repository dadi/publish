'use strict'

import {h, Component} from 'preact'

import ProfileEdit from 'containers/ProfileEdit/ProfileEdit'

import {setPageTitle} from 'lib/util'

export default class ProfileEditView extends Component {
  render() {
    const {
      collection,
      group,
      section
    } = this.props

    return (
      <ProfileEdit
        collection={collection}
        group={group}
        onPageTitle={this.handlePageTitle}
        section={section}
      />
    )    
  }

  handlePageTitle(title) {
    // View should always control page title, as it has a direct relationship to route
    setPageTitle(title)
  }
}