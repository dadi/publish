'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './FileUpload.css'

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

  constructor(props) {
    super(props)
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
          type="file"
          accept={accept}
          onChange={this.handleFileSelect.bind(this)}
        />
      </div>
    )
  }

  handleFileSelect(event) {
    event.preventDefault()
    const {onChange} = this.props

    onChange(event.target.files[0])
  }

  handleDrop(event) {
    const {onChange} = this.props

    event.preventDefault()
    onChange(event.dataTransfer.files[0])
  }

  handleDragOver(event) {
    event.preventDefault()
  }
}
