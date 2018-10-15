'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'
import 'fetch'

import {buildUrl} from 'lib/router'

import Style from 'lib/Style'
import styles from './FieldImage.css'

import Button from 'components/Button/Button'
import DropArea from 'components/DropArea/DropArea'
import FileUpload from 'components/FileUpload/FileUpload'
import Label from 'components/Label/Label'

export default class FieldImageEdit extends Component { 
  static propTypes = {
    /**
     * The name of the collection being edited, as per the URL.
     */
    collection: proptypes.string,

    /**
     * A subset of the app config containing data specific to this field type.
     */
    config: proptypes.object,

    /**
     * The schema of the API being used.
     */
    currentApi: proptypes.object,

    /**
     * The schema of the collection being edited.
     */
    currentCollection: proptypes.object,

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
     * If defined, specifies a group where the current collection belongs.
     */
    group: proptypes.string,

    /**
     * The name of the field within the collection. May be a path using
     * dot-notation.
     */
    name: proptypes.string,

    /**
    * A callback to be used to obtain the base URL for the given page, as
    * determined by the view.
    */
    onBuildBaseUrl: proptypes.func,

    /**
     * A callback to be fired whenever the field wants to update its value to
     * a successful state. The function receives the name of the field and the
     * new value as arguments.
     */
    onChange: proptypes.string,

    /**
     * A callback to be fired whenever the field wants to update its value to
     * or from an error state. The function receives the name of the field, a
     * Boolean value indicating whether or not there's an error and finally the
     * new value of the field.
     */
    onError: proptypes.string,

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
    value: proptypes.bool
  }

  constructor(props) {
    super(props)

    this.state.signedUrl = null
  }

  render() {
    let {
      collection,
      config = {},
      displayName,
      documentId,
      group,
      name,
      onBuildBaseUrl,
      schema,
      value
    } = this.props

    const fieldImage = config.FieldImage || {}
    const accept = fieldImage.accept
    const fieldLocalType = schema.publish && schema.publish.subType ? schema.publish.subType : schema.type
    const href = onBuildBaseUrl ?  onBuildBaseUrl({
      createNew: !Boolean(documentId),
      documentId,
      referenceFieldSelect: name
    }) : ''

    const isReference = schema.type === 'Reference'
    const singleFile = schema.settings && schema.settings.limit === 1
    const values = (value && !Array.isArray(value)) ? [value] : value

    return (
      <Label label={displayName}>
        {values &&
          values.map(value =>
            <div class={styles['value-container']}>
              <div class={styles.thumbnails}>
                  <img
                    class={styles.thumbnail}
                    src={this.getImageSrc(value)}
                  />
              </div>
              <Button
                accent="destruct"
                className={styles['remove-existing']}
                onClick={this.handleRemoveFile.bind(this, value.fileName)}
                size="small"
              >Delete</Button>
            </div>
          )
        }
        <div>
          <div class={styles.placeholder}>
            <Button
              accent="data"
              className={styles['select-existing']}
              href={href}
              size="small"
            >Select existing {fieldLocalType.toLowerCase()}</Button>
          </div>
          <div class={styles['upload-options']}>
            <DropArea
              draggingText={`Drop image${singleFile ? '' : 's'} here`}
              onDrop={this.handleFileChange.bind(this)}
            >
              <div class={styles['upload-drop']}>
                Drop file{singleFile ? '' : 's'} to upload
              </div>
            </DropArea>
          </div>
          <div class={styles['upload-select']}>
            <span>or </span>
            <FileUpload
              allowDrop={true}
              accept={accept}
              multiple={!singleFile}
              onChange={this.handleFileChange.bind(this)}
            />
          </div>
        </div>
      </Label>
    )
  }

  getImageSrc(value) {
    const {config} = this.props
    const cdn = config ? config.cdn : null

    if (!value) return null

    if (value._previewData) return value._previewData

    if (value.url) return value.url

    if (value.path) {
      if (
        cdn &&
        cdn.publicUrl
      ) {
        return `${cdn.publicUrl}/${value.path}`
      } else {
        return value.path
      }
    }
  }
  
  handleRemoveFile(fileName) {
    const {name, onChange, schema, value} = this.props
    const values = (value && !Array.isArray(value)) ? [value] : value
    let newValues = values.filter((v) => v.fileName !== fileName)

    if (newValues.length === 0) {
      newValues = null
    }

    if (typeof onChange === 'function') {
      onChange.call(this, name, newValues)
    }
  }

  handleAddFiles(files) {
    const {
      config,
      name,
      onChange,
      schema,
      value
    } = this.props
    const singleFile = schema.settings && schema.settings.limit === 1

    if(singleFile) {
      return this.handleFileChange([files[0]])
    }

    let values = []
    if(value) {
      values = Array.isArray(value) ? value : [value]
    }

    //filter for uniqueness by file name and concat
    const fileNames = values.map((value) => value.fileName)
    processedFiles = processedFiles.filter((value) => !fileNames.includes(value.fileName))
    onChange.call(this, name,  values.concat(processedFiles))
  }

  handleFileChange(files) {
    const {
      config,
      name,
      onChange,
      schema,
      value
    } = this.props
    const singleFile = schema.settings && schema.settings.limit === 1

    let values = []
    if(value) {
      values = Array.isArray(value) ? value : [value]
    }

    let processedFiles = []

    for (let index = 0; index < files.length; index++) {
      const file = files[index]
      const reader = new FileReader()

      reader.onload = event => {
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

          if(singleFile) {
            return onChange.call(this, name, processedFiles[0])
          }

          //filter for uniqueness by file name and concat
          const fileNames = values.map((value) => value.fileName)
          processedFiles = processedFiles.filter((value) => !fileNames.includes(value.fileName))
          onChange.call(this, name,  values.concat(processedFiles))
        }
      }

      reader.readAsDataURL(file)
    }
  }
}