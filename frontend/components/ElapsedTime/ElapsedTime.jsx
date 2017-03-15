'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

/**
 * The time elapsed since a given event, as an automatically updated string.
 */
export default class ElapsedTime extends Component {
  static propTypes = {
    /**
     * The timestamp of the event (in seconds).
     */
    timestamp: proptypes.number
  }

  constructor(props) {
    super(props)

    this.INTERVAL_STRINGS = {
      0: 'Just now',
      11: 'Less than a minute ago',
      61: 'Over a minute ago'
    }

    this.timer = null

    this.state.activeInterval = null
  }

  checkInterval() {
    const {timestamp} = this.props
    const currentTimestamp = Math.floor(new Date().getTime() / 1000)
    const timeDifference = Math.max(currentTimestamp - timestamp, 0)
    const intervals = Object.keys(this.INTERVAL_STRINGS)

    let interval = intervals[0]

    for (let key in this.INTERVAL_STRINGS) {
      const intervalInt = parseInt(key)

      if (intervalInt > timeDifference) {
        return this.updateInterval(interval, intervalInt - timeDifference)
      }

      interval = key
    }

    return this.updateInterval(intervals[intervals.length - 1], null)
  }

  updateInterval(interval, nextInterval) {
    this.setState({
      activeInterval: interval
    })

    if (nextInterval) {
      clearTimeout(this.timer)

      this.timer = setTimeout(this.checkInterval.bind(this), nextInterval * 1000)
    }
  }

  componentWillMount() {
    this.checkInterval()
  }

  componentWillUpdate() {
    this.checkInterval()
  }

  render() {
    const {timestamp} = this.props
    const {activeInterval} = this.state

    if (!timestamp || !activeInterval) return null

    return this.INTERVAL_STRINGS[activeInterval]
  }
}
