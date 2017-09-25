import {h, options, render} from 'preact'
import {expect} from 'chai'

import DateTimePicker from './DateTimePicker'

const fecha = require('fecha')
const padDay = day => {
  if (day >= 10) return day.toString()

  return `0${day}`
}

let mockDate

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

beforeEach(() => {
  // Sun Jan 13 2017 00:00:00
  mockDate = new Date(2017, 0, 13)
})

afterEach(() => {
  mount(null).remove()
})

describe('DateTimePicker component', () => {
  it('has propTypes', () => {
    const component = (
      <DateTimePicker />
    )

    expect(component.nodeName.propTypes).to.exist
    expect(Object.keys(component.nodeName.propTypes)).to.have.length.above(0)
  })

  it('renders a container including the class names passed via the `className` prop', () => {
    mount(
      <DateTimePicker
        date={mockDate}
        className="custom-class"
      />
    )

    expect($('.container.custom-class').length).to.equal(1)
  })

  describe('picking a day', () => {
    it('renders a label with the month and year corresponding to the given date', () => {
      mount(
        <DateTimePicker date={mockDate} />
      )

      expect($('.current-date').length).to.equal(1)
      expect($('.current-date')[0].textContent).to.equal('January 2017')
    })

    it('renders a label with the current month and year if no date is provided', () => {
      const currentDate = new Date()
      const expectedLabel = fecha.format(currentDate, 'MMMM YYYY')

      mount(
        <DateTimePicker />
      )

      expect($('.current-date').length).to.equal(1)
      expect($('.current-date')[0].textContent).to.equal(expectedLabel)
    })

    it('renders minus (-) and plus (+) signs, which move back and forth the month being edited', () => {
      mount(
        <DateTimePicker date={mockDate} />
      )

      $('.container .arrow')[0].click()

      expect($('.current-date')[0].textContent).to.equal('December 2016')

      $('.container .arrow')[1].click()

      expect($('.current-date')[0].textContent).to.equal('January 2017')

      $('.container .arrow')[1].click()

      expect($('.current-date')[0].textContent).to.equal('February 2017')
    })

    it('renders a cell for each day of the selected month', () => {
      const firstDayOfMonth = new Date(mockDate.getFullYear(), mockDate.getMonth(), 1)
      const lastDayOfMonth = new Date(mockDate.getFullYear(), mockDate.getMonth() + 1, 0)
      const daysInMonth = lastDayOfMonth.getDate() - firstDayOfMonth.getDate() + 1
      const expectedLabels = Array.apply(null, {length: daysInMonth}).map(Number.call, n => {
        return padDay(n + 1)
      })

      let labelsToFind = expectedLabels.length

      mount(
        <DateTimePicker date={mockDate} />
      )

      // We're only interested in testing the days of the current month,
      // so we filter out faded labels that correspond to days carried over
      // from previous/next month.
      const calendarDays = $('.calendar-day:not(.calendar-day-faded)')
      const labels = Array.from(calendarDays).map(node => node.textContent)

      expect(labels).to.deep.equal(expectedLabels)
    })

    it('highlights the cell corresponding to the present day (if visible)', () => {
      const currentDate = new Date()
      const currentDay = padDay(currentDate.getDate())

      mount(
        <DateTimePicker date={currentDate} />
      )

      expect($('.calendar-day-current')[0].textContent).to.equal(currentDay)
    })

    it('fires the `onChange` callback with the date as a paramter when a new day is picked', () => {
      const callback = jest.fn()

      mount(
        <DateTimePicker
          date={mockDate}
          onChange={callback}
        />
      )

      const calendarDays = $('.calendar-day:not(.calendar-day-faded)')

      // Select the 7th of January (index 6, because 0-index)
      calendarDays[6].click()

      const expectedDate = new Date(mockDate.getTime())
      expectedDate.setDate(7)

      expect(callback.mock.calls.length).to.equal(1)
      expect(callback.mock.calls[0][0].getTime()).to.equal(expectedDate.getTime())
    })
  })

  describe('picking the time', () => {
    it('starts with the time selector hidden', () => {
      let component

      mount(
        <DateTimePicker
          date={mockDate}
          ref={el => component = el}
        />
      )

      expect(component.state.pickingTime).to.be.false
      expect($('.hours-container').length).to.equal(0)
    })

    it('renders a button displaying the time of the selected date', () => {
      mockDate.setHours(3)
      mockDate.setMinutes(37)

      mount(
        <DateTimePicker date={mockDate} />
      )

      expect($('button.hours-launcher').length).to.equal(1)
      expect($('button.hours-launcher')[0].textContent).to.equal('03:37')
    })

    it('expands the time selector when the time button is clicked', () => {
      let component

      mount(
        <DateTimePicker
          date={mockDate}
          ref={el => component = el}
        />
      )

      $('.hours-launcher')[0].click()

      expect(component.state.pickingTime).to.be.true
      expect($('.hours-container').length).to.equal(1)
      expect($('.hours-container .hour').length).to.equal(24 * component.TIME_PICKER_HOUR_SUBDIVISIONS)
    })

    it('fires the `onChange` callback with the date as a paramter when a new time is picked', () => {
      const callback = jest.fn()
      const expectedDate = new Date(mockDate.getTime())

      expectedDate.setHours(16)

      let component

      mount(
        <DateTimePicker
          date={mockDate}
          onChange={callback}
          ref={el => component = el}
        />
      )

      $('.hours-launcher')[0].click()

      const hours = $('.hours-container .hour')
      let hourSelected

      // Looking for the element that corresponds to 16:00
      for (let i = 0; i < hours.length; i++) {
        if (hours[i].textContent === '16:00') {
          hourSelected = hours[i]

          break
        }
      }

      hourSelected.click()

      expect(callback.mock.calls.length).to.equal(1)
      expect(callback.mock.calls[0][0].getTime()).to.equal(expectedDate.getTime())
    })
  })
})
