import React from 'react'
import styles from './Toolbar.css'

/**
 * A toolbar that sits fixed at the bottom of the screen. Each immediate
 * child is seen as a group, and groups are horizontally distributed across
 * the width of the page.
 */
export default class Toolbar extends React.Component {
  render() {
    const {children} = this.props

    return (
      React.Children.count(children) !== 0 && (
        <footer className={styles.container}>{children}</footer>
      )
    )
  }
}
