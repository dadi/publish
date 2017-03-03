'use strict'

import { h, Component } from 'preact'
import 'whatwg-fetch'

import Label from 'components/Label/Label'

export default class FieldImage extends Component { 

  constructor(props) {
    super(props)

    this.state.fileName = ''
    this.state.signedUrl = ''
    this.state.file = null
    this.state.error = ''
  }

  render() {
    const { config } = this.props

    return (
      <Label label="Image">
        <p>{this.state.signedUrl}</p>
        {config && config.FieldImage && (
          <input 
            type="file" 
            accept={ config.FieldImage.accept } 
            onChange={this.handleFileChange.bind(this)}
          />
        )}
        <pre>{this.state.error}</pre>
      </Label>
    )
  }

  uploadToS3() {

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
        console.log(resp)
      })
    }).catch(err => {
      console.log("ERR", err)
    })
  }

  handleFileChange(event) {
    event.preventDefault()

    const { config } = this.props

    this.setState({
      fileName: event.target.files[0].name,
      file: event.target.files[0]
    })

    if (config.FieldImage.s3.enabled) {
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
