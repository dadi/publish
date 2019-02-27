'use strict'

import * as appActions from 'actions/appActions'
import * as Constants from 'lib/constants'
import {bindActionCreators} from 'redux'
import {connectHelper} from 'lib/util'
import {h, Component} from 'preact'
import proptypes from 'proptypes'
import Style from 'lib/Style'
//import styles from './LoadingBar.css'

/**
 * Renders a filter selector for a given field component.
 */
class FieldFilter extends Component {
  static propTypes = {
    /**
     * The global actions object.
     */
    actions: proptypes.object,

    /**
     * The component that renders the field's filter.
     */
    component: proptypes.object,

    /**
     * Callback to fire when the value of the filter is updated.
     */
    onUpdate: proptypes.func,

    /**
     * The global state object.
     */
    state: proptypes.object,

    /**
     * The filter value.
     */
    value: proptypes.object
  }
  
  render() {
    const {
      component: FilterComponent,
      onUpdate,
      state,
      styles,
      value
    } = this.props

    return (
      <FilterComponent
        config={state.config}
        onUpdate={onUpdate}
        value={value}
      />
    )
  }
}

export default connectHelper(
  state => state.app,
  dispatch => bindActionCreators(appActions, dispatch)
)(FieldFilter)
