'use strict'

import {h, Component} from 'preact'
import {connect} from 'preact-redux'
import {bindActionCreators} from 'redux'

import {connectHelper} from 'lib/util'
import * as Constants from 'lib/constants'
  
import * as apiActions from 'actions/apiActions'
import * as appActions from 'actions/appActions'
import * as documentActions from 'actions/documentActions'
import * as documentsActions from 'actions/documentsActions'
import * as routerActions from 'actions/routerActions'
import * as userActions from 'actions/userActions'

class LoadingBar extends Component {
  render() {
    const {state} = this.props

    let statesWithLoadingStatus = Object.keys(state).filter(key => {
      return Object.keys(state[key]).filter(field => {
        return Object.is(state[key][field], Constants.STATUS_LOADING)
      }).length
    }).length

    return (
      <div style="width:100%;height:5px;background:transparent;position:fixed;top:0px;left:0px;z-index:10000;">
        {statesWithLoadingStatus > 0 && (
          <div style="width:100%;height:100%;background:green;"></div>
        )}
      </div>
    )
  }
}

export default connectHelper(
  state => state,
  dispatch => bindActionCreators({...apiActions,...appActions,...documentActions,...documentsActions,...routerActions,...userActions}, dispatch)
)(LoadingBar)

