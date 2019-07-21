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
    if (date instanceof Date) return date

    // Unix timestamp.
    if (typeof date === 'number') return new Date(date)

    const intDate = parseInt(date, 10)

    // Unix timestamp in a string.
    if (intDate.toString() === date) return new Date(intDate)

    try {
      const parsedDate =
        // Fecha requires a format. If no format is specified, try ISO.
        fecha.parse(date, format || FORMAT_ISO8601) ||
        // If format is specified but parsing fails, the value has probably been
        // received from API which stores the values in ISO string format. Try ISO.
        fecha.parse(date, FORMAT_ISO8601)

      // Fecha parses the string as a local date; we want to parse it as a UTC date.
      // The conversion method adds back the difference from UTC, so that the string
      // argument is effectively parsed as a UTC date.
      return this._getLocalDateFromUTCDate(parsedDate)
    } catch (error) {
      console.error('Error while parsing date:', error)

      return null
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
