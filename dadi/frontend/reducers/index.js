'use strict'

import api from 'reducers/api'
import app from 'reducers/app'
import document from 'reducers/document'
import documents from 'reducers/documents'
import user from 'reducers/user'
import {routerReducer as routing} from 'preact-router-redux'

export {
  api,
  app,
  document,
  documents,
  user,
  routing
}
