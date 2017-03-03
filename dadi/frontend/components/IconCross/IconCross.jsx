import {h, Component} from 'preact'

import Style from 'lib/Style'
import styles from './IconCross.css'

export default class IconCross extends Component {
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
