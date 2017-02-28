import { h, Component } from 'preact'

import { Style } from 'lib/util'
import styles from './IconBurger.css'

export default class IconBurger extends Component {
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
