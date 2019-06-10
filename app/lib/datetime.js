import fecha from 'fecha'

const FORMAT_ISO8601 = 'YYYY-MM-DDTHH:mm:ss.SSSZ'

export default class DateTime {
  constructor(date, inputFormat, defaultFormat) {
    this.defaultFormat = defaultFormat
    this.localDate = this._parse(date, inputFormat)
  }

  _isValidDate(date) {
    return date instanceof Date && !isNaN(date.getTime())
  }

  _parse(date, format) {
    // If `date` is already a Date object, there's nothing we need
    // to do.
    if (date instanceof Date) {
      return date
    } else if (typeof date === 'number') {
      // If it's a number, we assume it's a timestamp, so we create a date
      // from that. We'll assume the timestamp is in seconds, so we need to
      // convert to milliseconds when passing to Date().
      return new Date(date)
    } else if (typeof date === 'string') {
      // If there is a `format` specified, we'll try to parse the date using
      // that.
      if (format && format !== 'unix') {
        try {
          const parsedDate = fecha.parse(date, format)

          // If the date was not parsed correctly, let's pass it through the
          // parsing function again, but this time without a format. It may
          // be that it's picked up as either a numeric timestamp or ISO8601.
          if (parsedDate === null) {
            return this._parse(date, null)
          }

          // When parsing a date from a string, it'll be parsed to the local
          // time, which we do not want. So we get a new date that is computed
          // by applying the timezone offset, which effectively means parsing
          // the string as a UTC date.
          return this._getLocalDateFromUTCDate(parsedDate)
        } catch (err) {
          console.error('Error parsing date', err)

          return null
        }
      } else {
        const intDate = parseInt(date)

        // It might be that the input date is still a timestamp, but represented
        // as a string. If that's the case, we use the parsed int and treat it
        // as a timestamp.
        if (intDate.toString() === date) {
          return new Date(intDate)
        } else {
          // We assume the input string is in ISO8601 format.
          return this._parse(date, FORMAT_ISO8601)
        }
      }
    }
  }

  _getLocalDateFromUTCDate(date) {
    if (!date) return date

    const localDate = new Date(date)

    localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset())

    return localDate
  }

  _getUTCDateFromLocalDate(date) {
    if (!date) return date

    const utcDate = new Date(date)

    utcDate.setMinutes(utcDate.getMinutes() + utcDate.getTimezoneOffset())

    return utcDate
  }

  format(format, convertToUTC = true) {
    let output = null

    try {
      const date = convertToUTC
        ? this._getUTCDateFromLocalDate(this.localDate)
        : this.localDate

      if (format === 'unix') {
        output =
          typeof this.defaultFormat === 'string'
            ? fecha.format(date, this.defaultFormat)
            : date.getTime().toString()
      } else {
        output = fecha.format(date, format)
      }
    } catch (err) {
      console.error('Error formatting date:', err)
    }

    return output
  }

  getDate() {
    return this.localDate
  }

  isSameDayAs(date) {
    if (!this.isValid() || !this._isValidDate(date)) return false

    return (
      this.localDate.getFullYear() === date.getFullYear() &&
      this.localDate.getMonth() === date.getMonth() &&
      this.localDate.getDate() === date.getDate()
    )
  }

  isValid() {
    return this._isValidDate(this.localDate)
  }
}
