'use strict'

import * as types from '../actions/actionTypes'

const initialState = {
  activeApi: {
    uri: 'http://api.eb.dev.dadi.technology',
    port: 80,
    version: 'vjoin',
    database: 'testdb'
  }
}

export default function app (state = initialState, action = {}) {
  switch (action.type) {

    default:
      return state
  }
}
