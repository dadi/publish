import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './IconBurger.css'

/**
 * A hamburger icon.
 */
export default class IconBurger extends Component {
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
        viewBox="0 0 20 16"
        class={styles.icon}
        width={this.props.width}
        height={this.props.height}
      >
        <title>Menu</title>
        <path d="M1.178 1h17.69M1.178 8h17.69m-17.69 7h17.69" stroke-width="2" fill-rule="evenodd" stroke-linecap="square"/>
      </svg>
    )
  }
}
