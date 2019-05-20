import React from 'react'
import styles from './Page.css'

/**
 * A container that wraps a view/page.
 */
export default class Page extends React.Component {
  render() {
    return (
      <div className={styles.container}>
        {this.props.children}
      </div>
    )
  }
}
