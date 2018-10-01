'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

/**
 * Component for wrapping the children with an <a> if a certain condition is met.
 */
export default class ConditionalLink extends Component {
  static propTypes = {
    /**
     * The children.
     */
    children: proptypes.node,

    /**
     * Result of the conditional expression.
     */
    condition: proptypes.bool,

    /**
     * Link address.
     */
    href: proptypes.string
  }

  render() {
    const {children, condition, href} = this.props

    if (condition) {
      return (
        <a href={href}>
          {children}
        </a>
      )
    }

    return children[0]
  }
}
