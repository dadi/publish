'use strict'

import * as Types from 'actions/actionTypes'
import {urlHelper} from 'lib/util'

const defaultSelectLocationState = state => state.router

export default function syncRouteWithStore(history, store, {
  selectLocationState = defaultSelectLocationState} = {}) {

  if (typeof selectLocationState(store.getState()) === 'undefined') {
    throw new Error('state.router missing')
  }

  let currentLocation
  let initialLocation
  let isTimeTraveling

  let unsubscribeFromStore
  let unsubscribeFromHistory

  // Get location in store
  const getLocationInStore = (fallbackToInitial) => {
    let locationState = selectLocationState(store.getState())
    return locationState.locationBeforeTransitions || (fallbackToInitial ? initialLocation : undefined)
  }

  const handleLocationChange = (location) => {
    if (isTimeTraveling) {
      return
    }

    currentLocation = location

    if (!initialLocation) {
      initialLocation = location
      if (getLocationInStore()) {
        return
      }
    }

    let params = urlHelper().paramsToObject(history.location.search)

    // Update the store by calling action
    store.dispatch({
      type: Types.LOCATION_CHANGE,
      locationBeforeTransitions: history.location,
      params
    })
  }

  const handleStoreChange = () => {
    const locationInStore = getLocationInStore(true)
    
    if (!locationInStore || Object.is(locationInStore, currentLocation || initialLocation)) {
      return
    }
    isTimeTraveling = true
    history.push(locationInStore)
    isTimeTraveling = false
  }

  unsubscribeFromStore = store.subscribe(handleStoreChange)
  handleStoreChange()

  // Set initial location to value in store
  initialLocation = getLocationInStore()

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
