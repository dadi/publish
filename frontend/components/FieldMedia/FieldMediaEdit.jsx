'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'
import 'fetch'

import Style from 'lib/Style'
import styles from './FieldMedia.css'

import Button from 'components/Button/Button'
import DropArea from 'components/DropArea/DropArea'
import FieldMediaItem from './FieldMediaItem'
import FileUpload from 'components/FileUpload/FileUpload'
import Label from 'components/Label/Label'

const fileSize = require('file-size')

export default class FieldMediaEdit extends Component { 
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

    const acceptedMimeTypes = schema.validation && schema.validation.mimeTypes || ['*/*']
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
      <Label label={displayName} className={styles.label}>
        {values &&
          values.map((value, idx) => {

            let file = {
              name: value.fileName.split('.').slice(0, -1).join('.'),
              size: fileSize(value.contentLength).human('si') || '',
              ext: value.fileName.split('.').pop()  
            }

            let styleValueContainer = new Style(styles, 'value-container')
              .addIf('value-container-first', values.length > 1 && idx === 0)
              .addIf('value-container-last', values.length > 1 && idx === values.length - 1)
              .addIf('value-container-solo', values.length === 1)

            return ( 
              <div class={styleValueContainer.getClasses()}>
                <FieldMediaItem
                  config={config}
                  value={value}
                />
                <abbr class={styles['file-name']} title={value.fileName}>{file.name}</abbr>
                <span class={styles['file-size']}>{file.size}</span>
                <span class={styles['file-ext']}>{file.ext}</span>
                <Button
                  accent="destruct"
                  className={styles['remove-existing']}
                  onClick={this.handleRemoveFile.bind(this, value.fileName)}
                  size="small"
                ><span>×</span></Button>
              </div>
            )
          })
        }

        <div class={styles.upload}>
          <div class={styles['upload-options']}>
            <DropArea
              draggingText={`Drop file${singleFile ? '' : 's'} here`}
              onDrop={this.handleFileChange.bind(this)}
            >
              <div class={styles['upload-drop']}>
                Drop file{singleFile ? '' : 's'} to upload
              </div>
            </DropArea>
          </div>

          <div class={styles.placeholder}>
            <Button
              accent="neutral"
              size="small"
              href={href}
            >Select existing {fieldLocalType.toLowerCase()}</Button>
          </div>

          <div class={styles['upload-select']}>
            <FileUpload
              accept={acceptedMimeTypes}
              allowDrop={true}
              multiple={!singleFile}
              onChange={this.handleFileChange.bind(this)}
            />
          </div>
        </div>
      </Label>
    )
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

  handleFileChange (files) {
    const {
      config,
      name,
      onChange,
      schema,
      value
    } = this.props

    const singleFile = schema.settings && schema.settings.limit === 1

    let processedFiles = []
    let values = []

    if (value) {
      values = Array.isArray(value) ? value : [value]
    }

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

          if (singleFile) {
            return onChange.call(this, name, processedFiles[0])
          }

          // Filter for uniqueness by file name and concat.
          const fileNames = values.map(value => value.fileName)

          processedFiles = processedFiles.filter(value => !fileNames.includes(value.fileName))
          onChange.call(this, name, values.concat(processedFiles))
        }
      }

      reader.readAsDataURL(file)
    }
  }
}