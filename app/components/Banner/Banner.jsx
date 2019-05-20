import React from 'react'
import proptypes from 'prop-types'

import Style from 'lib/Style'
import styles from './Banner.css'

/**
 * A horizontal strip rendering informative text.
 */
export default class Banner extends React.Component {
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
    const bannerStyle = new Style(styles, 'banner')
      .add(`banner-${this.props.accent}`)

    return (
      <p className={bannerStyle.getClasses()}>
        {this.props.children}
      </p>
    )
  }
}
