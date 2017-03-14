'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './IconCross.css'

/**
 * A cross icon.
 */
export default class IconCross extends Component {
  static propTypes = {
    /**
     * The height of the arrow.
     */
    height: proptypes.number,

    /**
     * The width of the arrow.
     */
    width: proptypes.number
  }

  static defaultProps = {
    width: 10,
    height: 10
  }

  render() {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        class={styles.icon}
        width={this.props.width}
        height={this.props.height}
      >
        <title>Close</title>
        <path d="M18.984 6.422l-5.578 5.578 5.578 5.578-1.406 1.406-5.578-5.578-5.578 5.578-1.406-1.406 5.578-5.578-5.578-5.578 1.406-1.406 5.578 5.578 5.578-5.578z" />
      </svg>
    )
  }
}
