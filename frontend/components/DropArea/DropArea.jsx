'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './DropArea.css'

export default class FileUpload extends Component {
  static propTypes = {
    /**
     * The contents of the drop area.
     */
    children: proptypes.node,

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
    draggingText: 'Drop files here'
  }

  constructor(props) {
    super(props)

    this.state.dragging = false
  }

  render() {
    const {
      children,
      draggingText
    } = this.props
    const {dragging} = this.state
    const dropStyles = new Style(styles, 'droparea')
      .addIf('droparea-active', dragging)

    return (
      <div
        class={dropStyles.getClasses()}
        data-dragtext={draggingText}
        onDrop={this.handleDrop.bind(this)} 
        onDragEnter={this.handleDrag.bind(this)}
        onDragLeave={this.handleDrag.bind(this)}
        onDragOver={this.handleDrag.bind(this)}
      >
        <div class={styles.contents}>
          {children}
        </div>
      </div>
    )
  }

  handleDrop(event) {
    const {onDrop} = this.props

    this.setState({
      dragging: false
    })
    if (typeof onDrop === 'function') {
      onDrop(event.dataTransfer.files)
    }

    event.preventDefault()
  }

  handleDrag(event) {
    this.setState({
      dragging: event.type !== 'dragleave'
    })

    event.preventDefault()
  }
}
