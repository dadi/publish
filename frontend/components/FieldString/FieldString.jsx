import * as Constants from 'lib/constants'
import {URLParams} from 'lib/util/urlParams'
import edit from './FieldStringEdit'
import filterEdit from './FieldStringFilterEdit'
import list from './FieldStringList'

const filterOperators = {
  $regex: 'contains',
  $ne: 'does not equal'
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
  filterEdit,
  filterOperators,
  getCtaText,
  getInstructionText,
  list
}
