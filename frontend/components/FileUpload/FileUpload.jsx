'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './FileUpload.css'
import {getUniqueId} from 'lib/util'

import Button from 'components/Button/Button'

export default class FileUpload extends Component {

  static propTypes = {
    /**
     * File type acceptance.
     */
    accept: proptypes.string,

    /**
     * The elements to be rendered inside of the component.
     */
    children: proptypes.node,

    /**
     * Whether to accept multiple files.
     */
    multiple: proptypes.bool,

    /**
     * Callback to be executed when there is a change in the value of the field.
     */
    onChange: proptypes.func,

    /**
     * Whether the field is required.
     */
    required: proptypes.bool,
  }

  static defaultProps = {
    multiple: false
  }

  componentWillMount() {
    this.fileInputId = getUniqueId()
  }

  render() {
    const {
      accept,
      children,
      multiple
    } = this.props

    return (
      <div>
        <input 
          accept={accept}
          class={styles['file-input']}
          id={this.fileInputId}
          multiple={multiple}
          type="file"
          onChange={this.handleFileSelect.bind(this)}
        />
        <label
          class={styles['label-file']}
          for={this.fileInputId}
        >{children}</label>
      </div>
    )
  }

  handleFileSelect(event) {
    const {onChange} = this.props

    if (typeof onChange === 'function') {
      onChange(event.target.files)
    }

    event.preventDefault()
  }
}
