import * as Constants from 'lib/constants'
import {URLParams} from 'lib/util/urlParams'
import edit from './FieldStringEdit'
import filter from './FieldStringFilter'
import list from './FieldStringList'

const operators = {
  $ne: 'does not equal',
  $regex: 'contains'
}

const beforeReferenceSelect = ({collection, field}) => {
  return {
    collection: Constants.MEDIA_COLLECTION_SCHEMA,
    limit: 1
  }
}

const afterReferenceSelect = ({documents, field}) => {
  let searchParameters = new URLParams(window.location.search).toObject() || {}

  return {
    meta: {
      [field]: {
        image: {
          position: searchParameters.position,
          selection: documents
        }
      }
    },
    update: {}
  }
}

const getCtaText = documents => {
  let noun = documents && documents.length === 1 ?
    'image' :
    'images'

  return `Insert ${noun}`
}

const getInstructionText = () => {
  return 'Choose a media object to insert'
}

export {
  afterReferenceSelect,
  beforeReferenceSelect,
  edit,
  filter,
  getCtaText,
  getInstructionText,
  list,
  operators
}
