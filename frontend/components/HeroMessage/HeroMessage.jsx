'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './HeroMessage.css'

/**
 * A simple call-to-action HeroMessage.
 */
export default class HeroMessage extends Component {
  static propTypes = {
    /**
     * The text to be rendered inside the button.
     */
    children: proptypes.node,

    subtitle: proptypes.string,

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
