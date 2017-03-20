'use strict'

import {h, Component} from 'preact'
import 'fetch'

import {buildUrl} from 'lib/router'

import Label from 'components/Label/Label'

export default class FieldImage extends Component { 

  constructor(props) {
    super(props)

    this.state = {
      imageUrl: null,
      fileName: null,
      signedUrl: null,
      file: null,
      error: null
    }
  }

  render() {
    const {config} = this.props
    const {imageUrl, error} = this.state
    console.log(config)

    return (
      <Label label="Image">
        {imageUrl && (
          <img src={imageUrl} />
        )}
        {config && (
          <input 
            type="file" 
            accept={config.accept} 
            onChange={this.handleFileChange.bind(this)}
          />
        )}
        <pre>{error}</pre>
      </Label>
    )
  }

  uploadToS3() {
    const {config} = this.props

    let body = new FormData()

    body.append('file', this.state.file)

    let options = {
      method: 'PUT',
      body: this.state.file,
      headers: {
        'Content-Type': this.state.file.type,
        'x-amz-acl': 'public-read'
      }
    }


    fetch(this.state.signedUrl, options).then(res => {
      res.text().then(resp => {
        this.setState({
          imageUrl: buildUrl(`${config.cdn.host}:${config.cdn.port || 80}`, config.cdn.path, this.state.fileName)
        })
      })
    }).catch(err => {
      console.log("ERR", err)
    })
  }

  handleFileChange(event) {
    event.preventDefault()

    const {config} = this.props

    this.setState({
      fileName: event.target.files[0].name,
      file: event.target.files[0]
    })

    if (config.s3.enabled) {
      fetch('/fields/image/s3/sign', {
        credentials: 'same-origin',
        method: 'POST',
        responseType: 'json',
        headers: {
          'Content-Type': 'application/json',
          'ContentType': this.state.file.type
        },
        body: JSON.stringify({fileName: event.target.files[0].name})
        
      }).then(response => {

        return response.json().then(json => {
          if (json.err) return json.err // Trigger error

          if (json.url) {

            // Store Signed URL
            this.setState({
              signedUrl: json.url
            })
            this.uploadToS3()
          }
        })
      })
    }
  }
}
