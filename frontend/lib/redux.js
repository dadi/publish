import * as Types from 'actions/actionTypes'

export function batchActions(...args) {
  // This functions accepts both an array of actions or an action as each
  // argument.
  const actions = args.length === 1 ? args[0] : args
  
  return {
    type: Types.BATCH_ACTIONS,
    actions: actions
  };
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
