import React from 'react'
import styles from './SpinningWheel.css'

/**
 * A loading screen with a spinning wheel.
 */
export default class SpinningWheel extends React.Component {
  render() {
    return (
      <div aria-hidden={true} className={styles.wrapper}>
        <i className={styles.square} />
        <i className={styles.square} />
        <i className={styles.square} />
      </div>
    )
  }
}
