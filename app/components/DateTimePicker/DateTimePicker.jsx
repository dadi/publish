import React from 'react'
import proptypes from 'prop-types'

import Style from 'lib/Style'
import styles from './DateTimePicker.css'

import DateTime from 'lib/datetime'

/**
 * Dialog for picking date and time for an input field.
 */
export default class DateTimePicker extends React.Component {
  static propTypes = {
    /**
     * Classes to append to the button element.
     */
    className: proptypes.string,

    /**
     * The Date object representing the currently selected date.
     */
    date: proptypes.object,

    /**
     * A callback to be fired when a new date is selected.
     */
    onChange: proptypes.func
  }

  constructor(props) {
    super(props)

    this.TIME_PICKER_HOUR_SUBDIVISIONS = 2

    this.hoursContainerRef = null
    this.hoursRefs = []

    const date = props.date || new Date()
    const displayDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      1
    )

    this.state = {
      displayDate,
      monthOffset: 0,
      pickingTime: false
    }
  }

  componentWillReceiveProps(nextProps) {
    const {date} = this.props
    const {date: nextDate} = nextProps

    if (date && nextDate && (date.getTime() !== nextDate.getTime())) {
      this.setState({
        monthOffset: 0
      })      
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const {pickingTime} = this.state

    // Let's find the closest hour to the one currently selected, so we can
    // adjust the scroll position accordingly.
    if (!prevState.pickingTime && pickingTime) {
      const date = this.getInternalDate()
      
      let closestDate

      this.hoursRefs.some(hourRef => {
        if (hourRef.date.getTime() > date.getTime()) {
          return true
        }

        closestDate = hourRef
      })

      const offset = closestDate && closestDate.element.offsetTop

      if (this.hoursContainerRef) {
        this.hoursContainerRef.scrollTop = offset - (this.hoursContainerRef.clientHeight / 2)
      }
    }
  }

  getInternalDate(overrides = {}, monthOffset = this.state.monthOffset) {
    const date = this.props.date || new Date()
    const dateTime = new DateTime(date)

    if (!dateTime.isValid()) {
      return null
    }

    const {year, month, day, hours, minutes} = overrides

    return new Date(
      year !== undefined ? year : date.getFullYear(),
      month !== undefined ? month : date.getMonth() + monthOffset,
      day !== undefined ? day : date.getDate(),
      hours !== undefined ? hours : date.getHours(),
      minutes !== undefined ? minutes : date.getMinutes()
    )
  }

  handleDatePick(date) {
    const {onChange} = this.props

    if (typeof onChange === 'function') {
      onChange.call(this, date)
    }
  }

  handleMonthChange(change) {
    const {displayDate} = this.state
    const newDate = new Date(displayDate.getTime())

    console.log({change})

    newDate.setMonth(newDate.getMonth() + change)

    this.setState({
      displayDate: newDate
    })
  }

  handleTimeToggle() {
    const {pickingTime} = this.state

    this.setState({
      pickingTime: !pickingTime
    })
  }

  render() {
    const {className} = this.props
    const {displayDate, pickingTime} = this.state
    const containerStyle = new Style(styles, 'container').addResolved(className)
    const firstDayOfMonth = new Date(displayDate.getFullYear(), displayDate.getMonth(), 1)
    const lastDayOfMonth = new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 0)
    const daysFromPreviousMonth = firstDayOfMonth.getDay()
    const numWeeks = Math.ceil((lastDayOfMonth.getDate() - firstDayOfMonth.getDate() + 1 + daysFromPreviousMonth) / 7)
    const displayDateTime = new DateTime(displayDate)

    let rows = []

    for (let week = 0; week < numWeeks; week++) {
      let days = []

      for (let weekDay = 1; weekDay <= 7; weekDay++) {
        days.push(
          this.renderDay((week * 7) + weekDay - daysFromPreviousMonth)
        )
      }

      rows.push(
        <tr key={week}>{days}</tr>
      )
    }

    return (
      <div className={containerStyle.getClasses()}>
        <div className={styles.head}>
          <button
            className={styles.arrow}
            onClick={this.handleMonthChange.bind(this, -1)}
            type="button"
          >←</button>

          <p className={styles['current-date']}>{displayDateTime.format('MMMM YYYY')}</p>

          <button
            className={styles.arrow}
            onClick={this.handleMonthChange.bind(this, 1)}
            type="button"
          >→</button>
        </div>

        <table className={styles.calendar}>
          <thead>
            <tr>
              <th className={styles['calendar-head']}>Su</th>
              <th className={styles['calendar-head']}>Mo</th>
              <th className={styles['calendar-head']}>Tu</th>
              <th className={styles['calendar-head']}>We</th>
              <th className={styles['calendar-head']}>Th</th>
              <th className={styles['calendar-head']}>Fr</th>
              <th className={styles['calendar-head']}>Sa</th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>

        <button
          className={styles['hours-launcher']}
          onClick={this.handleTimeToggle.bind(this)}
          type="button">{displayDateTime.format('HH:mm')}
        </button>

        {pickingTime && this.renderHours()}
      </div>
    )
  }

  renderDay(dayOffset) {
    const {date: valueDate} = this.props
    const {displayDate: date} = this.state
    const currentMonth = date.getMonth()
    const newDate = new Date(date.getTime())

    newDate.setDate(dayOffset)

    const dateTime = new DateTime(newDate)
    const day = newDate.getDate()
    const paddedDay = day >= 10 ? day : `0${day}`
    const dayStyle = new Style(styles, 'calendar-day')
      .addIf('calendar-day-faded', newDate.getMonth() !== currentMonth)
      .addIf('calendar-day-current', dateTime.isSameDayAs(new Date()))
      .addIf('calendar-day-active', dateTime.isSameDayAs(valueDate))

    return (
      <td key={paddedDay}>
        <button
          className={dayStyle.getClasses()}
          onClick={this.handleDatePick.bind(this, newDate)}
          type="button"
        >{paddedDay}</button>
      </td>
    )
  }

  renderHours() {
    let hours = []

    for (let i = 0; i < 24 * this.TIME_PICKER_HOUR_SUBDIVISIONS; i++) {
      const date = this.getInternalDate({
        hours: 0,
        minutes: i * 30
      })

      hours.push(
        <li key={date.getTime()}>
          <button
            className={styles.hour}
            onClick={this.handleDatePick.bind(this, date)}
            ref={element => {
              this.hoursRefs[i] = {
                date,
                element
              }
            }}
            type="button"
          >
            {new DateTime(date).format('HH:mm')}
          </button>
        </li>
      )
    }

    return (
      <div className={styles['hours-container']}>
        <ul
          className={styles.hours}
          ref={element => {
            this.hoursContainerRef = element
          }}
        >
          {hours}
        </ul>
      </div>
    )
  }
}
