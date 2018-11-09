import edit from './FieldMediaEdit'
import list from './FieldMediaList'
import referenceSelect from './FieldMediaReferenceSelect'

const beforeReferenceSelect = fetchObject => {
  const {parentCollection, referencedField} = fetchObject
  const fieldSchema = parentCollection.fields[referencedField]

  if (fieldSchema.validation && fieldSchema.validation.mimeTypes) {
    fetchObject.filters = {
      mimeType: {
        '$in': fieldSchema.validation.mimeTypes
      }
    }    
  }

  return fetchObject
}

export {beforeReferenceSelect, edit, list, referenceSelect}
