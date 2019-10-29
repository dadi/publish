import * as Constants from 'lib/constants'
import edit from './FieldMediaEdit'
import list from './FieldMediaList'
import referenceSelect from './FieldMediaReferenceSelect'

function onReferenceSelect({collection, field}) {
  const schema = collection.fields[field]
  const filters = schema.validation &&
    schema.validation.mimeTypes && {
      mimeType: {
        $in: schema.validation.mimeTypes
      }
    }

  return {
    collection: Constants.MEDIA_COLLECTION_SCHEMA,
    filters
  }
}

export {edit, list, onReferenceSelect, referenceSelect}
