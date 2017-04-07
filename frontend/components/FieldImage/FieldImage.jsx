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

export default class FieldImage extends Component { 

  static propTypes = {

    /**
     * Image specific config.
     */
    config: proptypes.object,

    /**
     * Callback to be executed when there is a change in the value of the field.
     */
    onChange: proptypes.func,

    /**
     * Callback to be executed when there is a new validation error in the field.
     */
    onError: proptypes.func,

    /**
     * The field value.
     */
    value: proptypes.object,

    /**
     * The field schema.
     */
    schema: proptypes.object
  }

  constructor(props) {
    super(props)

    this.state.signedUrl = null
  }

  render() {
    const {config, schema, value} = this.props
    const src = this.getImageSrc(value)
    const isReference = schema.type === 'Reference'
    const fieldLocalType = schema.publish && schema.publish.subType ? schema.publish.subType : schema.type
    const href = buildUrl(window.location.pathname, schema._id)

    return (
      <Label label="Image">
        {src && (
          <div class={styles.container}>
            <LazyLoader
              loadWhenIdle={true}
              >
              <img class={styles['image-thumb']} src={src} />
              <Button
                accent="destruct"
                size="small"
                className={styles['remove-existing']}
                onClick={this.handleRemoveFile.bind(this)}
              >Delete</Button>
            </LazyLoader>
          </div>
        )}
        {!src && (
          <div>
            {isReference && (
              <div class={styles['reference-options']}>
                <Button
                  accent="data"
                  size="small"
                  href={href}
                  className={styles['select-existing']}
                >Select existing {fieldLocalType}</Button>
              </div>
            )}
            {config && (
              <div class={styles['upload-options']}>
                <FileUpload
                  allowDrop={true}
                  accept={config.accept}
                  onChange={this.handleFileChange.bind(this)}
                />
              </div>
            )}
          </div>
        )}
      </Label>
    )
  }

  getImageSrc(value) {
    const {config} = this.props
    const cdn = config ? config.cdn : null

    if (!value) return null
    if (value.raw) return value.raw

    if (value.fileName) {
      if (cdn) {
        return buildUrl(`${cdn.host}:${cdn.port || 80}`, cdn.path, fileName)
      } else {
        return value.awsUrl  
      }
    }
  }
  
  handleRemoveFile() {
    const {onChange, schema} = this.props

    if (typeof onChange === 'function') {
      onChange.call(this, schema._id, null)
    }
  }

  handleFileChange (file) {
    const {config, onChange, schema} = this.props
    let reader = new FileReader()
    
    reader.onload = () => {
      if (typeof onChange === 'function') {
        onChange.call(this, schema._id, {
          fileName: file.name,
          raw: reader.result
        })
      }
    }

    reader.readAsDataURL(file)
  }
}
