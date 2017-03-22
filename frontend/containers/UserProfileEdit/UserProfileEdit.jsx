'use strict'

import {h, Component} from 'preact'
import {connect} from 'preact-redux'
import {bindActionCreators} from 'redux'

import {connectHelper} from 'lib/util'

import * as documentActions from 'actions/documentActions'

/**
 * The interface for editing a user profile.
 */
class UserProfileEdit extends Component {
  render() {
    return (
      <h1>PROFILES</h1> 
    )
  }
}

export default connectHelper(
  state => state,
  dispatch => bindActionCreators(documentActions, dispatch)
)(UserProfileEdit)
