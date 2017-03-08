'use strict'

import * as types from 'actions/actionTypes'

const defaultSelectLocationState = state => state.router

export default function syncRouteWithStore(history, store, {
  selectLocationState = defaultSelectLocationState} = {}) {

  if (typeof selectLocationState(store.getState()) === 'undefined') {
    throw new Error('state.routing missing')
  }

  let CURRENT_LOCATION
  let INITIAL_LOCATION
  let IS_TIME_TRAVELING

  let unsubscribeFromStore
  let unsubscribeFromHistory

  // Get location in store
  const getLocationInStore = (fallbackToInitial) => {
    let locationState = selectLocationState(store.getState())
    return locationState.locationBeforeTransitions || (fallbackToInitial ? INITIAL_LOCATION : undefined)
  }

  const handleLocationChange = (location) => {
    if (IS_TIME_TRAVELING) {
      return
    }

    CURRENT_LOCATION = location

    if (!INITIAL_LOCATION) {
      INITIAL_LOCATION = location
      if (getLocationInStore()) {
        return
      }
    }

    // Update the store by calling action
    store.dispatch({
      type: types.LOCATION_CHANGE,
      payload: history.location
    })
  }

  const handleStoreChange = () => {
    const locationInStore = getLocationInStore(true)
    if (!locationInStore || Object.is(locationInStore, CURRENT_LOCATION || INITIAL_LOCATION)) {
      return
    }
    IS_TIME_TRAVELING = true
    history.push(locationInStore)
    IS_TIME_TRAVELING = false
  }

  unsubscribeFromStore = store.subscribe(handleStoreChange)
  handleStoreChange()

  // Set initial location to value in store
  INITIAL_LOCATION = getLocationInStore()

  unsubscribeFromHistory = history.listen(handleLocationChange)

  if (history.location) {
    handleLocationChange(history.location)
  }

  return {
    ...history,
    listen(listener) {
      let lastSetLocation = getLocationInStore(true)
      let unsubscribed = false

      const unsubscribeFromStore = store.subscribe(() => {
        const currentLocation = getLocationInStore(true)
        if (currentLocation === lastSetLocation) {
          return
        }
        lastSetLocation = currentLocation
        if (!unsubscribed) {
          listener(lastSetLocation)
        }
      })

      listener(lastSetLocation)

      return () => {
        unsubscribed = true
        unsubscribeFromStore()
      }
    }
  }
}
