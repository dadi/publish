'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'
import 'fetch'

import {buildUrl} from 'lib/router'

import Style from 'lib/Style'
import styles from './FieldAsset.css'

import Button from 'components/Button/Button'
import FileUpload from 'components/FileUpload/FileUpload'
import Label from 'components/Label/Label'
import LazyLoader from 'containers/LazyLoader/LazyLoader'

export default class FieldAsset extends Component { 

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
    const {config, schema, showPreview, value} = this.props
    const src = this.getImageSrc(value)
    const isReference = schema.type === 'Reference'
    const fieldLocalType = schema.publish && schema.publish.subType ? schema.publish.subType : schema.type
    const assetFieldStyles = new Style(styles, 'container')
      .addIf('show-preview', showPreview)
    const href = buildUrl(window.location.pathname, schema._id)

    return (
      <Label label="Image">
        {src && (
          <div class={assetFieldStyles.getClasses()}>
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
    const cdn = config.cdn

    if (!value) return null
    if (value.raw) return value.raw

    if (value.fileName) {
      if (config.cdn) {
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

  // Below support for S3 image upload. Decision on whether to support direct push has yet to be made.

  // uploadToS3() {
    // const {config} = this.props

    // let body = new FormData()

    // body.append('file', this.state.file)

    // let options = {
    //   method: 'PUT',
    //   body: this.state.file,
    //   headers: {
    //     'Content-Type': this.state.file.type,
    //     'x-amz-acl': 'public-read'
    //   }
    // }


    // return fetch(this.state.signedUrl, options).then(res => {
    //   res.text().then(resp => {
    //     this.setState({
    //       imageUrl: buildUrl(`${config.cdn.host}:${config.cdn.port || 80}`, config.cdn.path, this.state.fileName)
    //     })
    //   })
    // }).catch(err => {
    //   console.log("ERR", err)
    // })
  // }

    // this.setState({
    //   fileName: event.target.files[0].name,
    //   file: event.target.files[0]
    // })
    // if (config.useAPI) {
    //   console.log(config)
    // }
    // if (config.s3.enabled) {
    //   fetch('/fields/image/s3/sign', {
    //     credentials: 'same-origin',
    //     method: 'POST',
    //     responseType: 'json',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'ContentType': this.state.file.type
    //     },
    //     body: JSON.stringify({fileName: event.target.files[0].name})
        
    //   }).then(response => {

    //     return response.json().then(json => {
    //       if (json.err) return json.err // Trigger error

    //       if (json.url) {

    //         // Store Signed URL
    //         this.setState({
    //           signedUrl: json.url
    //         })
    //         // this.uploadToS3()
    //       }
    //     })
    //   })
    // }
  // }
}
