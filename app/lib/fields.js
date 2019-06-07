export function getFieldType(schema) {
  let fieldType =
    schema.publish && schema.publish.subType
      ? schema.publish.subType
      : schema.type

  // For backwards compatibility.
  if (fieldType === 'Image') {
    fieldType = 'Media'
  }

  return fieldType
}

export function getVisibleFields({fields = {}, viewType}) {
  let foundDisplayProperty = false
  let enabledFields = Object.keys(fields).reduce((enabledFields, field) => {
    // Is there a publish block with a display property defined fro this view
    // type?
    if (
      fields[field].publish &&
      fields[field].publish.display &&
      fields[field].publish.display[viewType] !== undefined
    ) {
      if (fields[field].publish.display[viewType] === true) {
        enabledFields[field] = fields[field]
      }

      foundDisplayProperty = true
    }

    return enabledFields
  }, {})

  // If we came across at least one field with a display property defined for
  // this view type, we return the subset of the fields who have it set to
  // `true`. Otherwise, we return all fields.
  return foundDisplayProperty ? enabledFields : fields
}
