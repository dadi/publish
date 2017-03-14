'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './Banner.css'

/**
 * A horizontal strip rendering informative text.
 */
export default class Banner extends Component {
  static propTypes = {
    /**
     * Colour accent.
     */
    accent: proptypes.oneOf(['error']),

    /**
     * The text to be rendered.
     */
    children: proptypes.node
  }

  static defaultProps = {
    accent: 'error'
  }

  render() {
    let bannerClass = new Style(styles, 'banner')

    bannerClass.add(`banner-${this.props.accent}`)

    return (
      <p class={bannerClass.getClasses()}>
        {this.props.children}
      </p>
    )
  }
}
