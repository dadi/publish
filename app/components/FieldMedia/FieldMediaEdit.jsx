import 'unfetch/polyfill'
import Button from 'components/Button/Button'
import DropArea from 'components/DropArea/DropArea'
import FieldMediaItem from './FieldMediaItem'
import FileUpload from 'components/FileUpload/FileUpload'
import Label from 'components/Label/Label'
import proptypes from 'prop-types'
import React from 'react'
import styles from './FieldMedia.css'

const fileSize = require('file-size')

export default class FieldMediaEdit extends React.Component {
  static propTypes = {
    /**
     * The schema of the collection being edited.
     */
    collection: proptypes.object,

    /**
     * The application configuration object.
     */
    config: proptypes.object,

    /**
     * The human-friendly name of the field, to be displayed as a label.
     */
    displayName: proptypes.string,

    /**
     * The ID of the document being edited.
     */
    documentId: proptypes.string,

    /**
     * If defined, contains an error message to be displayed by the field.
     */
    error: proptypes.string,

    /**
     * Whether the field should be validated as soon as it mounts, rather than
     * waiting for a change event.
     */
    forceValidation: proptypes.bool,

    /**
     * The name of the field within the collection. May be a path using
     * dot-notation.
     */
    name: proptypes.string,

    /**
     * A callback to be fired whenever the value of the field changes. The
     * function will be called with the updated value as the first argument
     * and an optional error message as the second. This second argument gives
     * each field component the ability to perform their own validaton logic,
     * in addition to the central validation routine taking place upstream.
     */
    onChange: proptypes.func,

    /**
     * A callback to be fired when the components mounts, in case it wishes to
     * register an `onSave` callback with the store. That callback is then
     * fired before the field is saved, allowing the function to modify its
     * value before it is persisted.
     */
    onSaveRegister: proptypes.func,

    /**
     * A callback to be fired when the components mounts, in case it wishes to
     * register an `onValidate` callback with the store. That callback is then
     * fired when the field is validated, overriding the default validation
     * method introduced by the API validator module.
     */
    onValidateRegister: proptypes.func,

    /**
     * Whether the field is required.
     */
    required: proptypes.bool,

    /**
     * The field schema.
     */
    schema: proptypes.object,

    /**
     * The field value.
     */
    value: proptypes.oneOfType([
      proptypes.arrayOf(
        proptypes.oneOfType([proptypes.object, proptypes.string])
      ),
      proptypes.object,
      proptypes.string
    ])
  }

  constructor(props) {
    super(props)

    // We keep this error state in the component state rather than using the
    // error handler in the store because it's a special case. Other fields
    // will store the erroneous value and flag it as an error that must be
    // corrected before proceeding, whereas dropping an image with an invalid
    // MIME type stops it from being uploaded in the first place. There's no
    // need to correct anything because the value of the field hasn't changed
    // at all.
    this.state = {
      isInvalidMimeType: false
    }
  }

  componentDidMount() {
    const {onValidateRegister} = this.props

    if (typeof onValidateRegister === 'function') {
      onValidateRegister(this.validate.bind(this))
    }
  }

  handleFileChange(files) {
    const {onChange, schema, value} = this.props
    const singleFile = schema.settings && schema.settings.limit === 1
    const acceptedMimeTypes = schema.validation && schema.validation.mimeTypes

    let processedFiles = []
    let values = []

    if (value) {
      values = Array.isArray(value) ? value : [value]
    }

    // Iterate once to check if there are any files that don't match the MIME
    // type validation rules. We do this to avoid calling `readAsDataURL` on
    // some files before finding out that an invalid file exists and we must
    // abort the whole thing.
    if (Array.isArray(acceptedMimeTypes)) {
      for (let index = 0; index < files.length; index++) {
        const mimeType = files[index].type

        if (!acceptedMimeTypes.includes(mimeType)) {
          return this.setState({
            isInvalidMimeType: true
          })
        }
      }
    }

    this.setState({
      isInvalidMimeType: false
    })

    // Iterate a second time to actually process the files.
    for (let index = 0; index < files.length; index++) {
      const file = files[index]
      const reader = new FileReader()

      reader.onload = () => {
        processedFiles[index] = {
          _file: file,
          _previewData: reader.result,
          contentLength: file.size,
          fileName: file.name,
          mimetype: file.type
        }

        if (
          processedFiles.length === files.length &&
          typeof onChange === 'function'
        ) {
          if (singleFile) {
            return onChange.call(this, processedFiles[0])
          }

          // Filter for uniqueness by file name and concat.
          const fileNames = values.map(value => value.fileName)

          processedFiles = processedFiles.filter(
            value => !fileNames.includes(value.fileName)
          )
          onChange.call(this, values.concat(processedFiles))
        }
      }

      reader.readAsDataURL(file)
    }
  }

  handleRemoveFile(id) {
    const {onChange, value} = this.props
    const values = value && !Array.isArray(value) ? [value] : value

    let newValues = values.filter(value => {
      return value !== id && value._id !== id
    })

    if (newValues.length === 0) {
      newValues = null
    }

    if (typeof onChange === 'function') {
      onChange.call(this, newValues)
    }
  }

  render() {
    const {
      config = {},
      displayName,
      error,
      onEditReference,
      required,
      schema,
      value
    } = this.props
    const {isInvalidMimeType} = this.state
    const acceptedMimeTypes = schema.validation && schema.validation.mimeTypes
    const fieldLocalType =
      schema.publish && schema.publish.subType
        ? schema.publish.subType
        : schema.type
    const singleFile = schema.settings && schema.settings.limit === 1
    const values = value && !Array.isArray(value) ? [value] : value
    const isReadOnly = schema.publish && schema.publish.readonly === true
    const errorMessage =
      isInvalidMimeType &&
      `Files must be of type ${acceptedMimeTypes.join(', ')}`
    const comment =
      schema.comment || (required && 'Required') || (isReadOnly && 'Read only')

    return (
      <Label
        className={styles.label}
        comment={comment || null}
        error={error || isInvalidMimeType}
        errorMessage={errorMessage || null}
        label={displayName}
      >
        {values && (
          <div className={styles.values}>
            {values.map(value => {
              const id = value._id || value
              const displayName = value.fileName
                ? value.fileName.split('.').pop()
                : 'Document not found'

              return (
                <div className={styles.value} key={id} title={id}>
                  <FieldMediaItem config={config} value={value} />

                  {value.contentLength && (
                    <span className={styles['file-size']}>
                      {fileSize(value.contentLength).human('si') || ''}
                    </span>
                  )}

                  <span className={styles['file-ext']}>{displayName}</span>

                  <Button
                    accent="destruct"
                    className={styles['remove-existing']}
                    onClick={this.handleRemoveFile.bind(this, id)}
                    size="small"
                  >
                    <span>×</span>
                  </Button>
                </div>
              )
            })}
          </div>
        )}

        {!isReadOnly && (
          <div className={styles.upload}>
            <div className={styles['upload-options']}>
              <DropArea
                accept={acceptedMimeTypes}
                draggingText={`Drop file${singleFile ? '' : 's'} here`}
                onDrop={this.handleFileChange.bind(this)}
              >
                <div className={styles['upload-drop']}>
                  Drop file{singleFile ? '' : 's'} to upload
                </div>
              </DropArea>
            </div>

            <div className={styles.placeholder}>
              <Button accent="neutral" onClick={onEditReference} size="small">
                Select existing {fieldLocalType.toLowerCase()}
              </Button>
            </div>

            <div className={styles.placeholder}>
              <FileUpload
                accept={acceptedMimeTypes}
                multiple={!singleFile}
                onChange={this.handleFileChange.bind(this)}
              >
                <Button
                  accent="neutral"
                  className={styles['upload-select']}
                  size="small"
                  type="mock-stateful"
                >
                  Select from device
                </Button>
              </FileUpload>
            </div>
          </div>
        )}
      </Label>
    )
  }

  validate({validateFn, value}) {
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
}
