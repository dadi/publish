import {combineReducers} from 'redux'
import api from './api'
import app from './app'
import document from './document'
import documents from './documents'
import selection from './selection'
import user from './user'

export default combineReducers({
  api,
  app,
  document,
  documents,
  selection,
  user
})
