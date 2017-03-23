'use strict'

import {h, Component} from 'preact'
import {connect} from 'preact-redux'
import proptypes from 'proptypes'
import {bindActionCreators} from 'redux'
import {connectHelper} from 'lib/util'

import * as appActions from 'actions/appActions'

class LazyLoader extends Component {
  static propTypes = {

    /**
     * Load only when app status is idle
     */
    idleOnly: proptypes.bool,
    /**
     * The placeholder node to be rendered before load
     */
    placeholder: proptypes.node,
    /**
     * The asset to be loaded when appropriate
     */
    children: proptypes.node
  }

  static defaultProps = {
    idleOnly: true
  }

  render() {
    const {children, placeholder} = this.props

    const canLoad = this.evalLoadingConditions()

    if (!canLoad) {
      if (placeholder) return (placeholder)

      return null
    }

    return (<div>{children}</div>)
  }

  evalLoadingConditions() {
    const {idleOnly, state} = this.props

    // If an idle status is required and not met, block loading
    if (idleOnly && state.status !== 'STATUS_IDLE') return false

    return true
  }
}

export default connectHelper(
  state => state.app,
  dispatch => bindActionCreators(appActions, dispatch)
)(LazyLoader)

