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

  constructor (props) {
    super(props)
    this.state.dragOver = false
  }

  componentWillMount() {
    this.fileInputId = getUniqueId()
  }

  render() {
    const {allowDrop, accept} = this.props
    const {dragOver} = this.state

    const dropStyles = new Style(styles, 'container')
      .addIf('dropzone', allowDrop)
      .addIf('dropzone-active', dragOver)

    return (
      <div class={dropStyles.getClasses()}>
        {allowDrop && (
          <div
            onDrop={this.handleDrop.bind(this)} 
            onDragEnter={this.handleDrag.bind(this)}
            onDragLeave={this.handleDrag.bind(this)}
            onDragOver={this.handleDrag.bind(this)}
          >
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
    this.setState({dragOver: false})
    onChange(event.dataTransfer.files[0])

    event.preventDefault()
  }

  handleDrag(event) {
    this.setState({dragOver: event.type !== 'dragleave'})
    event.preventDefault()
  }
}
