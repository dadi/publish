import {getUniqueId} from 'lib/util'
import proptypes from 'prop-types'
import React from 'react'
import styles from './FileUpload.css'

export default class FileUpload extends React.Component {
  static propTypes = {
    /**
     * File type acceptance.
     */
    accept: proptypes.oneOfType([
      proptypes.arrayOf(proptypes.string),
      proptypes.string
    ]),

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
    required: proptypes.bool
  }

  static defaultProps = {
    accept: ['*/*'],
    multiple: false
  }

  componentWillMount() {
    this.fileInputId = getUniqueId()
  }

  render() {
    const {accept, children, multiple} = this.props

    return (
      <>
        <input
          accept={accept}
          className={styles['file-input']}
          id={this.fileInputId}
          multiple={multiple}
          type="file"
          onChange={this.handleFileSelect.bind(this)}
        />
        <label className={styles['label-file']} htmlFor={this.fileInputId}>
          {children}
        </label>
      </>
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
