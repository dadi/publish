'use strict'

import {h, Component} from 'preact'

import ProfileEdit from 'containers/ProfileEdit/ProfileEdit'

import {setPageTitle} from 'lib/util'

export default class ProfileEditView extends Component {
  render() {
    const {
      collection,
      group,
      referencedField,
      section
    } = this.props

    return (
      <ProfileEdit
        onBuildBaseUrl={this.handleBuildBaseUrl.bind(this)}
        referencedField={referencedField}
        section={section}
      />
    ) 
  }

  handleBuildBaseUrl() {
    const {
      collection,
      documentId,
      group,
      section
    } = this.props

    return ['profile']
  }

  handlePageTitle(title) {
    // View should always control page title, as it has a direct relationship to route
    setPageTitle(title)
  }
}