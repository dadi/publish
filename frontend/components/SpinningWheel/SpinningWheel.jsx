import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './SpinningWheel.css'

import LoadingAnimation from './loading.svg'

/**
 * A loading screen with a spinning wheel.
 */
export default class SpinningWheel extends Component {
  render() {
    return (
      <div class={styles.wrapper}>
        <LoadingAnimation/>
      </div>
    )
  }
}
