import React from 'react'
import proptypes from 'prop-types'

import Style from 'lib/Style'
import styles from './SpinningWheel.css'

/**
 * A loading screen with a spinning wheel.
 */
export default class SpinningWheel extends React.Component {
  render() {
    return (
      <div className={styles.wrapper} />
    )
  }
}
