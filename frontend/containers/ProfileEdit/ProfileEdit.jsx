'use strict'

import {Component, h} from 'preact'
import proptypes from 'proptypes'

import * as Constants from 'lib/constants'
import {connectHelper} from 'lib/util'
import {bindActionCreators} from 'redux'

import * as userActions from 'actions/userActions'

import DocumentEdit from 'containers/DocumentEdit/DocumentEdit'
import SubNavItem from 'components/SubNavItem/SubNavItem'

/**
 * The interface for editing a user profile.
 */
class ProfileEdit extends Component {
  static propTypes = {
    /**
    * A callback to be used to build the URLs for the various sections. It must
    * return an array of URL parts, to be prepended to the section slug.
    */
    onBuildSectionUrl: proptypes.func,

    /**
     * The current active section (if any).
     */
    section: proptypes.string,

    /**
     * All available sections.
     */
    sections: proptypes.array
  }

  render() {
    const {
      onBuildSectionUrl,
      section,
      state
    } = this.props
    const userDocument = state.user.remote

    if (!userDocument) return null

    return (
      <DocumentEdit
        collection={Constants.AUTH_COLLECTION}
        documentId={userDocument._id}
        onBuildSectionUrl={onBuildSectionUrl}
        section={section}
      />
    )
  }
}

export default connectHelper(
  state => ({
    api: state.api,
    app: state.app,
    user: state.user
  }),
  dispatch => bindActionCreators(userActions, dispatch)
)(ProfileEdit)
