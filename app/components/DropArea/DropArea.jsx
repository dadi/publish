import proptypes from 'prop-types'
import React from 'react'

import Style from 'lib/Style'
import styles from './DropArea.css'

export default class FileUpload extends React.Component {
  static propTypes = {
    /**
     * The contents of the drop area.
     */
    children: proptypes.node,

    /**
     * Classes to append to the button element.
     */
    className: proptypes.string,

    /**
     * The text to be displayed when a file is being dragged.
     */
    draggingText: proptypes.string,

    /**
     * Callback to be executed when files are dropped.
     */
    onDrop: proptypes.func
  }

  static defaultProps = {
    className: '',
    draggingText: 'Drop files here'
  }

  constructor(props) {
    super(props)

    this.state = {
      isDragging: false
    }
  }

  render() {
    const {children, className, draggingText} = this.props
    const {isDragging} = this.state
    const dropStyles = new Style(styles, 'droparea')
      .addIf('droparea-active', isDragging)
      .addResolved(className)

    return (
      <div
        className={dropStyles.getClasses()}
        data-dragtext={draggingText}
        onDrop={this.handleDrop.bind(this)}
        onDragEnter={this.handleDrag.bind(this, true)}
        onDragLeave={this.handleDrag.bind(this, false)}
      >
        <div className={styles.contents}>{children}</div>
      </div>
    )
  }

  handleDrop(event) {
    const {onDrop} = this.props

    this.setState({
      isDragging: false
    })

    if (typeof onDrop === 'function') {
      onDrop(event.dataTransfer.files)
    }

    event.preventDefault()
  }

  handleDrag(isDragging, event) {
    this.setState({
      isDragging
    })

    event.preventDefault()
  }
}
