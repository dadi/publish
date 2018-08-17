'use strict'

import {h, Component} from 'preact'

import ProfileEdit from 'containers/ProfileEdit/ProfileEdit'

import * as Constants from 'lib/constants'
import {setPageTitle} from 'lib/util'

export default class ProfileEditView extends Component {
  render() {
    const {
      collection,
      group,
      referencedField,
      section
    } = this.props

    setPageTitle('Profile')

    return (
      <ProfileEdit
        onBuildBaseUrl={this.handleBuildBaseUrl.bind(this)}
        referencedField={referencedField}
        section={section || 'credentials'}
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
}