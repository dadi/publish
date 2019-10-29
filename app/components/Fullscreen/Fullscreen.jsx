import proptypes from 'prop-types'
import React from 'react'
import ReactDOM from 'react-dom'
import styles from './Fullscreen.css'

const DOM_NODE = document.getElementById('app-fullscreen')

/**
 * A component that renders child nodes in a portal, hiding the main app
 * contents. This creates a fullscreen effect.
 */
export default class Fullscreen extends React.Component {
  static propTypes = {
    /**
     * The contents of the fullscreen wrapper.
     */
    children: proptypes.node
  }

  constructor(props) {
    super(props)

    this.el = document.createElement('div')
  }

  componentDidMount() {
    DOM_NODE.appendChild(this.el)
    DOM_NODE.classList.add(styles.active)
  }

  componentWillUnmount() {
    DOM_NODE.removeChild(this.el)
    DOM_NODE.classList.remove(styles.active)
  }

  render() {
    const {children} = this.props

    return ReactDOM.createPortal(children, this.el)
  }
}
