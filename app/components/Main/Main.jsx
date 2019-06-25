import normalize from './Normalize.css'
import proptypes from 'prop-types'
import React from 'react'
import styles from './Main.css'

/**
 * The main content body element.
 */
export default class Main extends React.Component {
  render() {
    const {children} = this.props

    return <main>{children}</main>
  }
}
