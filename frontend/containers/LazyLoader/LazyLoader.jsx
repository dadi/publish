'use strict'

import {h, Component} from 'preact'
import {connect} from 'preact-redux'
import * as Constants from 'lib/constants'
import proptypes from 'proptypes'
import {bindActionCreators} from 'redux'
import {connectHelper} from 'lib/util'

import * as appActions from 'actions/appActions'

class LazyLoader extends Component {
  static propTypes = {

    /**
     * Image style classes.
     */
    styles: proptypes.string,
    /**
     * Load only when app status is idle.
     */
    idleOnly: proptypes.bool
  }

  static defaultProps = {
    styles: "",
    idleOnly: true
  }

  constructor(props) {
    super(props)

    this.state = {
      status: Constants.STATUS_IDLE
    }
  }

  render() {
    const {
      styles,
      src
    } = this.props
    const {status} = this.state
    const canLoad = this.evalLoadingConditions()
    const canDisplay = Object.is(status, Constants.STATUS_LOADED)
    const loadFailed = Object.is(status, Constants.STATUS_FAILED)

    if (!canLoad) return null

    return (
      <img 
        src={src}
        style={!canDisplay && `display: none`}
        class={styles}
        onLoad={this.handleImageLoaded.bind(this)}
        onError={this.handleImageError.bind(this)}
      />
    )
  }

  handleImageLoaded() {
    this.setState({ status: Constants.STATUS_LOADED })
  }
  
  handleImageError() {
    this.setState({ status: Constants.STATUS_FAILED })
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

