'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './LoadingBar.css'

const INTERVAL_UPDATE = 250
const INTERVAL_VISIBLE = 200

/**
 * A progress bar indicating loading progress.
 */
export default class LoadingBar extends Component {
  constructor(props) {
    super(props)

    this.state.percentage = 0
    this.state.visible = false

    this.intervalBump = null
    this.intervalVisible = null
  }

  static propTypes = {
    /**
     * Whether the app is currently loading.
     */
    loading: proptypes.node,

    /**
     * The text to be rendered.
     */
    children: proptypes.node
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

    this.intervalVisible = setTimeout(() => {
      this.setState({
        visible: false
      })
    }, INTERVAL_VISIBLE)
  }

  componentDidUpdate(prevProps, prevState) {
    const {percentage, visible} = this.state
    const {loading} = this.props

    if (prevState.visible && !visible) {
      this.setState({
        percentage: 0
      })
    }

    if (!prevProps.loading && loading) {
      this.start()  
    }

    if (prevProps.loading && !loading) {
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
        class={styles.bar}
        style={`transform: translate3d(-${100 - (percentage * 100)}%, 0, 0); opacity: ${visible ? 1 : 0}`}
      >
        <div class={styles.tip} />
      </div>
    )
  }
}
