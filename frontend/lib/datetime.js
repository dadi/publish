const fecha = require('fecha')

export default class DateTime {
  constructor (date, format) {
    // If `date` is already a Date object, there's nothing we need
    // to do.
    if (date instanceof Date) {
      this.dateObj = date
    } else if (typeof date === 'number') {
      // If it's a number, we assume it's a timestamp, so we create a date
      // from that. We'll assume the timestamp is in seconds, so we need to
      // convert to milliseconds when passing to Date().
      this.dateObj = new Date(date)
    } else if (typeof date === 'string') {
      // If there is a `format` specified, we'll try to parse the date using
      // that.
      if (format) {
        try {
          this.dateObj = fecha.parse(date, format)
        } catch (err) {
          console.error('Error parsing date')
        }
      } else {
        const intDate = parseInt(date)

        // It might be that the input date is still a timestamp, but represented
        // as a string. If that's the case, we use the parsed int and treat it
        // as a timestamp.
        if (intDate.toString() === date) {
          this.dateObj = new Date(intDate)
        } else {
          // We assume the input string is in ISO8601 format.
          this.dateObj = new Date(Date.parse(date))
        }
      }
    }
  }

  format (format) {
    let output = null

    try {
      output = fecha.format(this.dateObj, format)
    } catch (err) {
      console.error('Error formatting date')
    }

    return output
  }

  getDate () {
    return this.dateObj
  }

  isSameDayAs (date) {
    if (!this.isValid(date)) return false

    return this.dateObj.getFullYear() === date.getFullYear() &&
      this.dateObj.getMonth() === date.getMonth() &&
      this.dateObj.getDate() === date.getDate()
  }

  isValid (date = this.dateObj) {
    return (date instanceof Date) && !isNaN(date.getTime())
  }
}
