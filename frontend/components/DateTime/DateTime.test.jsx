import {h, options, render} from 'preact'
import {expect} from 'chai'

import DateTime from './DateTime'

const fecha = require('fecha')
const FECHA_FORMATS = [
  'default',
  'shortDate',
  'mediumDate',
  'longDate',
  'fullDate',
  'shortTime',
  'mediumTime',
  'longTime'
]

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const WEEK = 7 * DAY
const YEAR = 365 * DAY
const MONTH = YEAR / 12

jest.useFakeTimers()

// DOM setup
let $, mount, root, scratch

options.debounceRendering = f => f()

beforeAll(() => {
  $ = sel => scratch.querySelectorAll(sel)
  mount = jsx => {
    root = render(jsx, scratch, root)

    document.body.appendChild(scratch)

    return root
  }
  scratch = document.createElement('div')
})

afterEach(() => {
  mount(null).remove()

  jest.resetModules()
  setInterval.mockClear()
})

describe('Checkbox component', () => {
  it('has propTypes', () => {
    const component = (
      <DateTime />
    )

    expect(component.nodeName.propTypes).to.exist
    expect(Object.keys(component.nodeName.propTypes)).to.have.length.above(0)
  })

  it('renders `null` if the date is invalid', () => {
    const bogusDate = 'not a date'
    const component = (
      <DateTime date={bogusDate} />
    )

    expect(component).to.equal(null)
  })

  it('accepts a date as a Date object and outputs its formatted value', () => {
    FECHA_FORMATS.forEach(format => {
      const date = new Date()

      const component = (
        <DateTime
          date={date}
          format={format}
        />
      )

      expect(component).to.equal(fecha.format(date, format))
    })
  })

  it('accepts a date as a numeric timestamp and outputs its formatted value', () => {
    FECHA_FORMATS.forEach(format => {
      const timestamp = new Date().getTime()

      const component = (
        <DateTime
          date={timestamp}
          format={format}
        />
      )

      expect(component).to.equal(fecha.format(new Date(timestamp), format))
    })
  })

  it('accepts a date as a string-represented timestamp and outputs its formatted value', () => {
    FECHA_FORMATS.forEach(format => {
      const timestamp = new Date().getTime()

      const component = (
        <DateTime
          date={timestamp.toString()}
          format={format}
        />
      )

      expect(component).to.equal(fecha.format(new Date(timestamp), format))
    })
  })

  it('accepts a date as a string formatted by fecha in the given `fromFormat` and outputs its formatted value', () => {
    FECHA_FORMATS.forEach(format => {
      FECHA_FORMATS.forEach(fromFormat => {
        const date = new Date()
        const formattedDate = fecha.format(date, fromFormat)
        const parsedDate = fecha.parse(formattedDate, fromFormat)

        const component = (
          <DateTime
            date={formattedDate}
            format={format}
            fromFormat={fromFormat}
          />
        )

        expect(component).to.equal(fecha.format(parsedDate, format))
      })
    })
  })

  describe('renders a string representing the time elapsed between the given `date` prop and the current time, whilst setting the refresh interval to the appropriate values', () => {
    it('renders "just now" if the time difference is less than 50 seconds, setting update interval to 10 seconds', () => {
      const date = new Date()

      date.setSeconds(date.getSeconds() - 30)

      const component = (
        <DateTime
          date={date}
          relative={true}
        />
      )

      expect(component).to.equal('just now')
      expect(setInterval.mock.calls[1][1]).to.equal(10 * SECOND)
    })

    it('renders "a minute ago" if the time difference is less than 2 minutes, setting update interval to 30 seconds', () => {
      const date = new Date()

      date.setMinutes(date.getMinutes() - 1)

      const component = (
        <DateTime
          date={date}
          relative={true}
        />
      )

      expect(component).to.equal('a minute ago')
      expect(setInterval.mock.calls[1][1]).to.equal(30 * SECOND)
    })

    it('renders "X minutes ago" if the time difference is less than 1 hour, setting update interval to 1 minute', () => {
      const date = new Date()

      date.setMinutes(date.getMinutes() - 17)

      const component = (
        <DateTime
          date={date}
          relative={true}
        />
      )

      expect(component).to.equal('17 minutes ago')
      expect(setInterval.mock.calls[1][1]).to.equal(MINUTE)
    })

    it('renders "an hour ago" if the time difference is less than 2 hours, setting update interval to 30 minutes', () => {
      const date = new Date()

      date.setMinutes(date.getMinutes() - 80)

      const component = (
        <DateTime
          date={date}
          relative={true}
        />
      )

      expect(component).to.equal('an hour ago')
      expect(setInterval.mock.calls[1][1]).to.equal(30 * MINUTE)
    })

    it('renders "X hours ago" if the time difference is less than 1 day, setting update interval to 1 hour', () => {
      const date = new Date()

      date.setHours(date.getHours() - 6)

      const component = (
        <DateTime
          date={date}
          relative={true}
        />
      )

      expect(component).to.equal('6 hours ago')
      expect(setInterval.mock.calls[1][1]).to.equal(HOUR)
    })

    it('renders "yesterday" if the time difference is less than 2 days, setting update interval to 1 hour', () => {
      const date = new Date()

      date.setHours(date.getHours() - 36)

      const component = (
        <DateTime
          date={date}
          relative={true}
        />
      )

      expect(component).to.equal('yesterday')
      expect(setInterval.mock.calls[1][1]).to.equal(HOUR)
    })

    it('renders "X days ago" if the time difference is less than 1 week, setting update interval to 1 day', () => {
      const date = new Date()

      date.setDate(date.getDate() - 4)

      const component = (
        <DateTime
          date={date}
          relative={true}
        />
      )

      expect(component).to.equal('4 days ago')
      expect(setInterval.mock.calls[1][1]).to.equal(DAY)
    })

    it('renders "a week ago" if the time difference is less than 2 weeks, setting update interval to 1 day', () => {
      const date = new Date()

      date.setDate(date.getDate() - 10)

      const component = (
        <DateTime
          date={date}
          relative={true}
        />
      )

      expect(component).to.equal('a week ago')
      expect(setInterval.mock.calls[1][1]).to.equal(DAY)
    })

    it('renders "X weeks ago" if the time difference is less than 1 month, setting update interval to 1 day', () => {
      const date = new Date()

      date.setDate(date.getDate() - 22)

      const component = (
        <DateTime
          date={date}
          relative={true}
        />
      )

      expect(component).to.equal('3 weeks ago')
      expect(setInterval.mock.calls[1][1]).to.equal(DAY)
    })

    it('renders "a month ago" if the time difference is less than 2 months, setting update interval to 1 day', () => {
      const date = new Date()

      date.setDate(date.getDate() - 40)

      const component = (
        <DateTime
          date={date}
          relative={true}
        />
      )

      expect(component).to.equal('a month ago')
      expect(setInterval.mock.calls[1][1]).to.equal(DAY)
    })

    it('renders "X months ago" if the time difference is less than 1 year, setting update interval to 1 day', () => {
      const date = new Date()

      date.setMonth(date.getMonth() - 5)

      const component = (
        <DateTime
          date={date}
          relative={true}
        />
      )

      expect(component).to.equal('5 months ago')
      expect(setInterval.mock.calls[1][1]).to.equal(DAY)
    })

    it('renders "X years ago" if the time difference is greater than or equal to 1 year, setting update interval to 1 day', () => {
      const date = new Date()

      date.setFullYear(date.getFullYear() - 3)

      const component = (
        <DateTime
          date={date}
          relative={true}
        />
      )

      expect(component).to.equal('3 years ago')
      expect(setInterval.mock.calls[1][1]).to.equal(DAY)
    })
  })
})
