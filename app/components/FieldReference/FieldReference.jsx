import edit from './FieldReferenceEdit'
import list from './FieldReferenceList'

function onReferenceSelect({api, collection, field}) {
  const schema = collection.fields[field]
  const referencedCollectionName =
    schema && schema.settings && schema.settings.collection

  // If there isn't a `settings.collection` property, the field is referencing
  // its own collection.
  if (!referencedCollectionName) {
    return {collection}
  }

  const referencedCollectionSchema = api.collections.find(apiCollection => {
    return apiCollection.slug === referencedCollectionName
  })

  return {
    collection: referencedCollectionSchema
  }
}

export {edit, list, onReferenceSelect}
