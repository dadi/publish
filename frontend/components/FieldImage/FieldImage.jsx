'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'
import 'fetch'

import {buildUrl} from 'lib/router'

import Label from 'components/Label/Label'

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
    const {config, value} = this.props
    const src = this.getImageSrc(value)

    return (
      <Label label="Image">
        {src && (
          <img width={100} src={src} />
        )}
        {config && (
          <input 
            type="file" 
            accept={config.accept} 
            onChange={this.handleFileChange.bind(this)}
          />
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

  handleFileChange(event) {
    event.preventDefault()

    const {config, onChange, schema} = this.props

    let reader = new FileReader()
    
    reader.onload = () => {
      if (typeof onChange === 'function') {
        onChange.call(this, schema._id, {
          fileName: event.target.files[0].name,
          raw: reader.result
        })
      }
    }
    reader.readAsDataURL(event.target.files[0])

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
  }
}
