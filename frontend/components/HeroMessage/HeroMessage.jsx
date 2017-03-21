'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './HeroMessage.css'

/**
 * An informative message at the centre of the page.
 */
export default class HeroMessage extends Component {
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
    const {
      children,
      subtitle,
      title
    } = this.props

    return (
      <div class={styles.container}>
        {title &&
          <h1 class={styles.title}>{title}</h1>
        }

        {subtitle &&
          <p class={styles.subtitle}>{subtitle}</p>
        }

        <div class={styles.children}>
          {children}
        </div>
      </div>
    )
  }
}
