'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'
import 'fetch'

import {buildUrl} from 'lib/router'

import Style from 'lib/Style'
import styles from './FieldImage.css'

import Button from 'components/Button/Button'
import FileUpload from 'components/FileUpload/FileUpload'
import Label from 'components/Label/Label'
import LazyLoader from 'containers/LazyLoader/LazyLoader'

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
    const {
      collection,
      config,
      documentId,
      group,
      onBuildBaseUrl,
      schema,
      value
    } = this.props
    const displayName = schema.label || schema._id
    const src = this.getImageSrc(value)
    const isReference = schema.type === 'Reference'
    const fieldLocalType = schema.publish && schema.publish.subType ? schema.publish.subType : schema.type
    const baseUrl = onBuildBaseUrl()
    const href = buildUrl(...baseUrl, 'select', schema._id)

    return (
      <Label label={displayName}>
        {value &&
          <div class={styles['value-container']}>
            <img
              class={styles.preview}
              src={src}
            />
            
            <Button
              accent="destruct"
              size="small"
              className={styles['remove-existing']}
              onClick={this.handleRemoveFile.bind(this)}
            >Delete</Button>
          </div>          
        }

        {!value &&
          <div>
            <div class={styles.placeholder}>
              <Button
                accent="data"
                size="small"
                href={href}
                className={styles['select-existing']}
              >Select existing {fieldLocalType.toLowerCase()}</Button>
            </div>

            <div class={styles['upload-options']}>
              <FileUpload
                allowDrop={true}
                accept={config.accept}
                onChange={this.handleFileChange.bind(this)}
              />
            </div>
          </div>
        }
      </Label>
    )
  }

  getImageSrc(value) {
    const {config} = this.props
    const cdn = config ? config.cdn : null
//console.log('------>', value)
    if (!value) return null

    if (value._previewData) return value._previewData

    if (value.path) {
      return value.path
    }
  }
  
  handleRemoveFile() {
    const {onChange, schema} = this.props

    if (typeof onChange === 'function') {
      onChange.call(this, schema._id, null)
    }
  }

  handleFileChange(file) {
    const {
      config,
      onChange,
      schema
    } = this.props
    const reader = new FileReader()
    
    reader.onload = event => {
      if (typeof onChange === 'function') {
        onChange.call(this, schema._id, {
          _file: file,
          _previewData: reader.result,
          contentLength: file.size,
          fileName: file.name,
          mimetype: file.type
        })
      }
    }

    reader.readAsDataURL(file)
  }
}
