import * as appActions from 'actions/appActions'
import {connectRedux} from 'lib/redux'
import proptypes from 'prop-types'
import React from 'react'
import styles from './LoadingBar.css'

const INTERVAL_UPDATE = 250
const INTERVAL_VISIBLE = 200

/**
 * A progress bar indicating loading progress.
 */
class LoadingBar extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      percentage: 0,
      visible: false
    }

    this.intervalBump = null
    this.intervalVisible = null
  }

  static propTypes = {
    /**
     * The global actions object.
     */
    actions: proptypes.object,

    /**
     * The global state object.
     */
    state: proptypes.object
  }

  start() {
    this.setState({
      percentage: 0,
      visible: true
    })

    clearInterval(this.intervalBump)

    this.intervalBump = setInterval(this.bump.bind(this), INTERVAL_UPDATE)
  }

  bump() {
    const {percentage} = this.state

    let amount = 0

    if (percentage >= 0 && percentage < 0.2) {
      amount = 0.1
    }

    if (percentage >= 0.2 && percentage < 0.5) {
      amount = 0.04
    }

    if (percentage >= 0.5 && percentage < 0.8) {
      amount = 0.02
    }

    if (percentage >= 0.8 && percentage < 0.99) {
      amount = 0.005
    }

    if (percentage >= 0.994) {
      return clearInterval(this.intervalBump)
    }

    this.setState({
      percentage: percentage + amount
    })
  }

  done() {
    this.setState({
      percentage: 1
    })

    clearInterval(this.intervalVisible)
    clearInterval(this.intervalBump)

    this.intervalVisible = setTimeout(() => {
      this.setState({
        visible: false
      })
    }, INTERVAL_VISIBLE)
  }

  componentDidUpdate(prevProps, prevState) {
    const {percentage, visible} = this.state
    const {state} = this.props
    const isLoading = Boolean(state.isLoading)
    const wasLoading = Boolean(prevProps.state.isLoading)

    if (prevState.visible && !visible) {
      this.setState({
        percentage: 0
      })
    }

    if (!wasLoading && isLoading) {
      this.start()
    }

    if (wasLoading && !isLoading) {
      this.done()
    }
  }

  componentWillUnmount() {
    // Clear intervals
    clearInterval(this.intervalBump)
    clearInterval(this.intervalVisible)
  }

  render() {
    const {percentage, visible} = this.state

    return (
      <div
        className={styles.bar}
        style={{
          opacity: visible ? '1' : '0',
          transform: `translate3d(-${100 - percentage * 100}%, 0, 0)`
        }}
      >
        <div className={styles.tip} />
      </div>
    )
  }
}

export default connectRedux(appActions)(LoadingBar)
