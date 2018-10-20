'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'
import 'fetch'

import {buildUrl} from 'lib/router'

import Style from 'lib/Style'
import styles from './FieldMedia.css'

import Button from 'components/Button/Button'
import DropArea from 'components/DropArea/DropArea'
import FileUpload from 'components/FileUpload/FileUpload'
import Label from 'components/Label/Label'

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

  getSource (value) {
    const {config} = this.props
    const cdn = config ? config.cdn : null

    if (!value) return null

    let metaData = [
      value.fileName,
      `${value.contentLength ? '(' + Math.floor(value.contentLength / 1000) + 'kB)' : ''}`
    ]

    if (value.mimetype) {
      if (value.mimetype.indexOf('image') > -1) {
        let src = ''
        if (value._previewData) {
          src = value._previewData
        } else if (value.url) {
          src = value.url
        } else if (value.path) {
          if (cdn && cdn.publicUrl) {
            src = `${cdn.publicUrl}/${value.path}`
          } else {
            src = value.path
          }
        }

        return (
          <img class={styles.thumbnail} src={src} title={metaData.join(' ')} />
        )
      } else {
        return (
          <span class={styles.thumbnail}>{metaData.join(' ')}</span>
        )
      }
    }
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

    const fieldMedia = config.FieldMedia || {}
    const accept = fieldMedia.accept
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
          <div class={styles['value-container']}>
            <div class={styles.thumbnails}>
              {values.map(value => (
                this.getSource(value)
              ))}
            </div>

            <Button
              accent="destruct"
              size="small"
              className={styles['remove-existing']}
              onClick={this.handleRemoveFile.bind(this)}
            >Delete</Button>
          </div>          
        }

        {!values &&
          <div>
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
                allowDrop={true}
                accept={accept}
                multiple={!singleFile}
                onChange={this.handleFileChange.bind(this)}
              />
            </div>
          </div>
        }
      </Label>
    )
  }

  handleRemoveFile() {
    const {name, onChange, schema} = this.props

    if (typeof onChange === 'function') {
      onChange.call(this, name, null)
    }
  }

  handleFileChange(files) {
    const {
      config,
      name,
      onChange,
      schema
    } = this.props
    const singleFile = schema.settings && schema.settings.limit === 1

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
          const finalFiles = singleFile ? processedFiles[0] : processedFiles

          onChange.call(this, name, finalFiles)
        }
      }

      reader.readAsDataURL(file)
    }
  }
}
