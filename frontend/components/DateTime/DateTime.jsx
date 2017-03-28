'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

const fecha = require('fecha')

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const WEEK = 7 * DAY
const YEAR = 365 * DAY
const MONTH = YEAR / 12

/**
 * The time elapsed since a given event, as an automatically updated string.
 */
export default class DateTime extends Component {
  static propTypes = {
    /**
     * The date to be displayed. This can be in one of three formats:
     *
     * - A Date() object
     * - A numeric timestamp
     * - A string representation of a date
     */
    date: proptypes.oneOfType([
      proptypes.object,
      proptypes.number,
      proptypes.string
    ]),

    /**
     * The format used to display the date. Conforms to fecha's format
     * tokens: https://github.com/taylorhakes/fecha#formatting-tokens
     */
    format: proptypes.string,

    /**
     * If present, the date received as prop will be parsed using the
     * given format as a reference.
     */
    fromFormat: proptypes.string,

    /**
     * Whether to display relative dates (e.g. an hour ago).
     * Overrides the `format` prop.
     */
    relative: proptypes.bool
  }

  static defaultProps = {
    format: 'default',
    fromFormat: null,
    relative: false
  }

  constructor(props) {
    const {relative} = props

    super(props)

    // Default update interval is one second. This will be progressively
    // enlarged depending on the relative date diff.
    if (relative) {
      this.resetInterval(SECOND)
    }
  }

  resetInterval() {
    clearInterval(this.interval)

    this.interval = setInterval(this.forceUpdate.bind(this), this.updateInterval)
  }

  componentDidUpdate(prevProps, prevState) {
    const {date, relative} = this.props

    if (date !== prevProps.date) {
      this.setUpdateInterval(SECOND)
    }
  }

  render() {
    const {
      date,
      format,
      fromFormat,
      relative
    } = this.props

    let dateObj

    // If `date` is already a Date object, there's nothing we need
    // to do.
    if (date instanceof Date) {
      dateObj = date
    } else if (typeof date === 'number') {
      // If it's a number, we assume it's a timestamp, so we create a date
      // from that. We'll assume the timestamp is in seconds, so we need to
      // convert to milliseconds when passing to Date().
      dateObj = new Date(date)
    } else if (typeof date === 'string') {
      // If there is a `fromFormat` prop, we'll try to parse the date using
      // that specific format.
      if (fromFormat) {
        dateObj = fecha.parse(date, fromFormat)
      } else {
        const intDate = parseInt(date)

        // It might be that the input date is still a timestamp, but represented
        // as a string. If that's the case, we use the parsed int and treat it
        // as a timestamp.
        if (intDate.toString() === date) {
          dateObj = new Date(intDate)
        } else {
          // We assume the input string is in ISO8601 format.
          dateObj = Date.parse(date)
        }
      }
    }

    if (!(dateObj instanceof Date)) {
      return null
    }

    const renderedDate = relative
      ? this.getRelativeDate(dateObj)
      : fecha.format(dateObj, format)

    return (
      <span>{renderedDate}</span>
    )
  }

  getRelativeDate(date) {
    const now = new Date().getTime()
    const diff = now - date.getTime()

    if (diff < (SECOND * 5)) {
      this.setUpdateInterval(2 * SECOND)

      return 'just now'
    }

    if (diff < (MINUTE * 2)) {
      this.setUpdateInterval(30 * SECOND)

      return 'a minute ago'
    }

    if (diff < HOUR) {
      this.setUpdateInterval(MINUTE)

      return `${Math.floor(diff / MINUTE)} minutes ago`
    }

    if (diff < (HOUR * 2)) {
      this.setUpdateInterval(30 * MINUTE)

      return 'an hour ago'
    }

    if (diff < DAY) {
      this.setUpdateInterval(HOUR)

      return `${Math.floor(diff / HOUR)} hours ago`
    }

    if (diff < (DAY * 2)) {
      this.setUpdateInterval(HOUR)

      return 'yesterday'
    }

    if (diff < WEEK) {
      this.setUpdateInterval(DAY)

      return `${Math.floor(diff / DAY)} days ago`
    }

    if (diff < (WEEK * 2)) {
      this.setUpdateInterval(DAY)

      return 'a week ago'
    }

    if (diff < MONTH) {
      this.setUpdateInterval(DAY)

      return `${Math.floor(diff / WEEK)} weeks ago`
    }

    if (diff < (MONTH * 2)) {
      this.setUpdateInterval(DAY)

      return 'a month ago'
    }

    if (diff < YEAR) {
      this.setUpdateInterval(DAY)

      return `${Math.floor(diff / MONTH)} months ago`
    }

    this.setUpdateInterval(DAY)

    return `${Math.floor(diff / YEAR)} years ago`
  }

  setUpdateInterval(interval) {
    if (interval === this.updateInterval) return

    clearInterval(this.interval)

    this.interval = setInterval(this.forceUpdate.bind(this), interval)
    this.updateInterval = interval
  }
}
