'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './FileUpload.css'
import {getUniqueId} from 'lib/util'

import Button from 'components/Button/Button'

export default class FileUpload extends Component {

  static propTypes = {
    /*
     * Allow drag and drop upload.
     */
    allowDrop: proptypes.bool,

    /**
     * File type acceptance.
     */
    accept: proptypes.string,

    /**
     * Callback to be executed when there is a change in the value of the field.
     */
    onChange: proptypes.func
  }

  componentWillMount() {
    this.fileInputId = getUniqueId()
  }

  render() {
    const {allowDrop, accept} = this.props
    const dropStyles = new Style(styles, 'container')
      .addIf('dropzone', allowDrop)

    return (
      <div class={dropStyles.getClasses()}>
        {allowDrop && (
          <div
            ondrop={this.handleDrop.bind(this)} 
            ondragover={this.handleDragOver.bind(this)}>
            <p>Drop files to upload</p>
          </div>
        )}
        {allowDrop && (
          <span class={styles.or}>or</span>
        )}

        <input 
          accept={accept}
          class={styles['file-input']}
          id={this.fileInputId}
          type="file"
          onChange={this.handleFileSelect.bind(this)}
        />

        <Button
          accent="data"
          forId={this.fileInputId}
          size="small"
        >Select from device</Button>
      </div>
    )
  }

  handleFileSelect(event) {
    const {onChange} = this.props

    onChange(event.target.files[0])

    event.preventDefault()
  }

  handleDrop(event) {
    const {onChange} = this.props

    onChange(event.dataTransfer.files[0])

    event.preventDefault()
  }

  handleDragOver(event) {
    event.preventDefault()
  }
}
