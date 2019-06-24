import * as Types from '../actions/actionTypes'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'

export function batchActions(...args) {
  // This functions accepts both an array of actions or an action as each
  // argument.
  const actions = args.length === 1 ? args[0] : args

  return {
    actions,
    type: Types.BATCH_ACTIONS
  }
}

export function enableBatching(reducer) {
  return function batchingReducer(state, action) {
    switch (action.type) {
      case Types.BATCH_ACTIONS:
        return action.actions.reduce(batchingReducer, state)

      default:
        return reducer(state, action)
    }
  }
}

export function connectRedux(...actions) {
  const mergedActions = actions.reduce((actions, action) => {
    return {...actions, ...action}
  }, {})

  return connect(
    state => ({state}),
    dispatch => ({
      actions: bindActionCreators(mergedActions, dispatch)
    })
  )
}
