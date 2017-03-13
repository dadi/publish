'use strict'

import {h, Component} from 'preact'
import {connect} from 'preact-redux'
import {bindActionCreators} from 'redux'
import {connectHelper} from 'lib/util'
  
import * as apiActions from 'actions/apiActions'
import * as appActions from 'actions/appActions'
import * as documentActions from 'actions/documentActions'
import * as documentsActions from 'actions/documentsActions'
import * as routerActions from 'actions/routerActions'
import * as userActions from 'actions/userActions'

class LoadingBar extends Component {
  render() {
    const { type } = this.props

    return (
      <p>LoadingBar</p>
    )
  }
}

export default connectHelper(
  state => state,
  dispatch => bindActionCreators({...apiActions,...appActions,...documentActions,...documentsActions,...routerActions,...userActions}, dispatch)
)(LoadingBar)

