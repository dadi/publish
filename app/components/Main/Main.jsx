import React from 'react'

/**
 * The main content body element.
 */
export default class Main extends React.Component {
  render() {
    const {children} = this.props

    return <main>{children}</main>
  }
}
