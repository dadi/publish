'use strict'

import {h, Component} from 'preact'

import UserProfileEdit from 'containers/UserProfileEdit/UserProfileEdit'

import {setPageTitle} from 'lib/util'

export default class UserProfile extends Component {
  render() {
    const {config} = this.props

    return (
      <UserProfileEdit 
        onPageTitle={this.handlePageTitle}
      />
    )    
  }

  handlePageTitle(title) {
    // We could have containers calling `setPageTitle()` directly, but it should
    // be up to the views to control the page title, otherwise we'd risk having
    // multiple containers wanting to set their own titles. Instead, containers
    // have a `onPageTitle` callback that they fire whenever they want to set
    // the title of the page. It's then up to the parent view to decide which
    // of those callbacks will set the title.

    setPageTitle(title)
  }
}