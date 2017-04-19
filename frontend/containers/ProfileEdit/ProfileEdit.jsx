'use strict'

import {Component, h} from 'preact'
import proptypes from 'proptypes'

import * as Constants from 'lib/constants'
import {connectHelper} from 'lib/util'
import {bindActionCreators} from 'redux'

import * as userActions from 'actions/userActions'

import DocumentEdit from 'containers/DocumentEdit/DocumentEdit'
import DocumentList from 'containers/DocumentList/DocumentList'
import DocumentListToolbar from 'containers/DocumentListToolbar/DocumentListToolbar'
import Header from 'containers/Header/Header'
import Main from 'components/Main/Main'
import Page from 'components/Page/Page'
import ProfileEditToolbar from 'containers/ProfileEditToolbar/ProfileEditToolbar'
import ReferencedDocumentHeader from 'containers/ReferencedDocumentHeader/ReferencedDocumentHeader'
import SubNavItem from 'components/SubNavItem/SubNavItem'

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

  render() {
    const {
      onBuildBaseUrl,
      referencedField,
      section,
      state
    } = this.props
    const userDocument = state.user.remote

    if (!userDocument) return null

    // Are we selecting a reference field?
    if (referencedField) {
      return (
        <Page>
          <ReferencedDocumentHeader
            collection={Constants.AUTH_COLLECTION}
            onBuildBaseUrl={onBuildBaseUrl}
            parentDocumentId={userDocument._id}
            referencedField={referencedField}
          />

          <Main>
            <DocumentList
              collection={Constants.AUTH_COLLECTION}
              documentId={userDocument._id}
              onBuildBaseUrl={onBuildBaseUrl}
              referencedField={referencedField}
              section={section}
              selectLimit={1}
            />

            <DocumentListToolbar
              collection={Constants.AUTH_COLLECTION}
              onBuildBaseUrl={onBuildBaseUrl}
              referencedField={referencedField}
            />
          </Main>
        </Page>
      )
    }

    return (
      <Page>
        <Header />

        <Main>
          <DocumentEdit
            collection={Constants.AUTH_COLLECTION}
            documentId={userDocument._id}
            onBuildBaseUrl={onBuildBaseUrl}
            section={section}
          />

          <ProfileEditToolbar />
        </Main>
      </Page>
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
