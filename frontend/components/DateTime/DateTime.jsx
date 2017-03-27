'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

const fecha = require('fecha')

/**
 * The time elapsed since a given event, as an automatically updated string.
 */
export default class ElapsedTime extends Component {
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
    fromFormat: proptypes.string
  }

  static defaultProps = {
    format: 'default',
    fromFormat: null
  }

  render() {
    const {
      date,
      format,
      fromFormat
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
      dateObj = new Date(date * 1000)
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
          dateObj = new Date(intDate * 1000)
        } else {
          
        }
      }
    }

    if (!(dateObj instanceof Date)) {
      //if (typeof date)
    }

    return (
      <span>{date}</span>
    )
  }
}
