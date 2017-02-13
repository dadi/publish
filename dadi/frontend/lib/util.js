'use strict'

import { connect } from 'preact-redux'
import { bindActionCreators } from 'redux'

export function bindActions (actions) {
  return dispatch => ({
    ...bindActionCreators(actions, dispatch)
  })
}

export function connectHelper (stateMap, dispatchMap) {
  return connect((state) => {
    return {
      state: stateMap(state)
    }
  }, (dispatch) => {
    return {
      actions: dispatchMap(dispatch)
    }
  })
}
