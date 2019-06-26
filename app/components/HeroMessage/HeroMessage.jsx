import proptypes from 'prop-types'
import React from 'react'

import Style from 'lib/Style'
import styles from './HeroMessage.css'

/**
 * An informative message at the centre of the page.
 */
export default class HeroMessage extends React.Component {
  static propTypes = {
    /**
     * The child elements to be rendered next to the message.
     */
    children: proptypes.node,

    /**
     * The subtitle of the message.
     */
    subtitle: proptypes.string,

    /**
     * The title of the message.
     */
    title: proptypes.string
  }

  render() {
    const {children, subtitle, title} = this.props

    return (
      <div className={styles.container}>
        {title && <h1 className={styles.title}>{title}</h1>}

        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}

        <div className={styles.children}>{children}</div>
      </div>
    )
  }
}
