'use strict'

import {h, Component} from 'preact'

import ProfileEdit from 'containers/ProfileEdit/ProfileEdit'

import {DocumentRoutes} from 'lib/document-routes'
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
        onGetRoutes={this.getRoutes.bind(this)}
        referencedField={referencedField}
        section={section}
      />
    ) 
  }

  getRoutes(paths) {
    return new DocumentRoutes(Object.assign(this.props, {paths}))
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