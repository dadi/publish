import edit from './FieldMediaEdit'
import list from './FieldMediaList'
import referenceSelect from './FieldMediaReferenceSelect'

function onValidate({validateFn, value}) {
  const arrayValue = Array.isArray(value) ? value : [value]
  const allValuesAreUploads = arrayValue.every(value => {
    return value && value._previewData && value._file
  })

  // If we're looking at a media file that the user is trying to upload,
  // there's no point in sending it to the validator module because it
  // is in a format that the module will not understand, causing the
  // validation to fail.
  if (allValuesAreUploads) {
    return Promise.resolve()
  }

  return validateFn(value)
}

export {edit, list, onValidate, referenceSelect}
