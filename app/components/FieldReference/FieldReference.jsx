import edit from './FieldReferenceEdit'
import list from './FieldReferenceList'
import listHeadAnnotation from './FieldReferenceListHeadAnnotation'

const beforeReferenceSelect = ({api, collection, field}) => {
  let schema = collection.fields[field]
  let referencedCollectionName = schema &&
    schema.settings &&
    schema.settings.collection

  // If there isn't a `settings.collection` property, the field is referencing 
  // its own collection.
  if (!referencedCollectionName) {
    return {collection}
  }

  let referencedCollectionSchema = api.collections.find(apiCollection => {
    return apiCollection.slug === referencedCollectionName
  })

  return {
    collection: referencedCollectionSchema
  }
}

export {
  beforeReferenceSelect,
  edit,
  list,
  listHeadAnnotation
}
