import proptypes from 'prop-types'
import React from 'react'
import ReactModal from 'react-modal'
import Style from 'lib/Style'
import styles from './Modal.css'

// Setting the root app element for accessibility purposes.
// (http://reactcommunity.org/react-modal/accessibility/#app-element)
ReactModal.setAppElement('#app')

/**
 * A modal component.
 */
export default class Modal extends React.Component {
  static propTypes = {
    /**
     * The contents of the modal.
     */
    children: proptypes.node,

    /**
     * A callback to be fired when the user attempts to close the modal.
     */
    onRequestClose: proptypes.func,

    /**
     * Whether to automatically hide any content that overflows the content
     * wrapper and enable scrolling.
     */
    scrollContent: proptypes.bool
  }

  static defaultProps = {
    scrollContent: true
  }

  constructor(props) {
    super(props)

    this.state = {
      isOpen: true
    }
  }

  close() {
    this.setState({
      isOpen: false
    })
  }

  render() {
    const {children, onRequestClose, scrollContent} = this.props
    const {isOpen} = this.state
    const contentStyle = new Style(styles, 'content').addIf(
      'content-scrollable',
      scrollContent
    )

    return (
      <ReactModal
        bodyOpenClassName={styles['body-open']}
        className={contentStyle.getClasses()}
        contentRef={el => (this.contentRef = el)}
        isOpen={isOpen}
        onRequestClose={onRequestClose}
        overlayClassName={styles.overlay}
        overlayRef={el => (this.overlayRef = el)}
        shouldCloseOnOverlayClick={true}
        shouldCloseOnEsc={true}
      >
        {children}
      </ReactModal>
    )
  }
}
