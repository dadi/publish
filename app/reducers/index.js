import app from './app'
import {combineReducers} from 'redux'
import document from './document'
import documents from './documents'
import selection from './selection'
import user from './user'

export default combineReducers({
  app,
  document,
  documents,
  selection,
  user
})
