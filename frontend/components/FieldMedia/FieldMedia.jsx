import * as Constants from 'lib/constants'
import edit from './FieldMediaEdit'
import list from './FieldMediaList'
import referenceSelect from './FieldMediaReferenceSelect'

const beforeReferenceSelect = ({collection, field}) => {
  let schema = collection.fields[field]
  let filter = schema.validation &&
    schema.validation.mimeTypes &&
    {
      mimeType: {
        '$in': schema.validation.mimeTypes
      }
    }

  return {
    collection: Constants.MEDIA_COLLECTION_SCHEMA,
    filter
  }
}

export {beforeReferenceSelect, edit, list, referenceSelect}
