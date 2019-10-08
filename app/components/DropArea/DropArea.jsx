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
     * Classes to append to the container element.
     */
    className: proptypes.string,

    /**
     * Callback to be executed when files are dropped.
     */
    onDrop: proptypes.func
  }

  constructor(props) {
    super(props)

    this.state = {
      isDragging: false
    }

    this.dragCount = 0
  }

  render() {
    const {children, className, contentClassname, onRenderDrag} = this.props
    const {isDragging} = this.state
    const dropStyles = new Style(styles, 'droparea')
      .addIf('droparea-active', isDragging)
      .addResolved(className)
    const contentStyle = new Style(styles, 'contents').addResolved(
      contentClassname
    )

    return (
      <div
        className={dropStyles.getClasses()}
        onDrop={this.handleDrop.bind(this)}
        onDragEnter={this.handleDrag.bind(this, true)}
        onDragLeave={this.handleDrag.bind(this, false)}
        ref={el => (this.container = el)}
      >
        {isDragging && Boolean(onRenderDrag) && (
          <div className={styles.information}>{onRenderDrag}</div>
        )}

        <div className={contentStyle.getClasses()}>{children}</div>
      </div>
    )
  }

  handleDrop(event) {
    const {onDrop} = this.props

    this.setState({
      isDragging: false
    })

    this.dragCount = 0

    if (typeof onDrop === 'function') {
      onDrop(event.dataTransfer.files)
    }

    event.preventDefault()
  }

  handleDrag(isDragging) {
    const previousDragCount = this.dragCount

    // This variable will contain a value greater than zero if there is a
    // file being dragged, or equal to zero if not.
    this.dragCount += isDragging ? 1 : -1

    if (previousDragCount === 0 && this.dragCount > 0) {
      this.setState({isDragging: true})
    } else if (previousDragCount > 0 && this.dragCount === 0) {
      this.setState({isDragging: false})
    }
  }
}
