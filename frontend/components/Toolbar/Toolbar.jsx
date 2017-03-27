'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './Toolbar.css'

/**
 * A toolbar that sits fixed at the bottom of the screen. Each immediate
 * child is seen as a group, and groups are horizontally distributed across
 * the width of the page.
 */
export default class Toolbar extends Component {
  static propTypes = {
    /**
     * The elements to be rendered inside the bar.
     */
    children: proptypes.node,

    /**
     * Whether the toolbar should have the default padding applied.
     */
    padded: proptypes.bool
  }

  static defaultProps = {
    padded: true
  }

  render() {
    const {padded} = this.props
    const toolbarStyle = new Style(styles, 'container')

    toolbarStyle.addIf('container-padded', padded)

    return (
      <footer class={toolbarStyle.getClasses()}>
        {this.props.children}
      </footer>
    )
  }
}
