'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './DateTimePicker.css'

import DateTime from 'lib/datetime'

/**
 * Dialog for picking date and time for an input field.
 */
export default class DateTimePicker extends Component {
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
    this.state.monthOffset = 0
    this.state.pickingTime = false
  }

  componentWillUpdate(nextProps, nextState) {
    const {date} = this.props

    if (date && nextProps.date && date.getTime() !== nextProps.date.getTime()) {
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

  render() {
    const {className} = this.props
    const value = this.props.date
    const {
      monthOffset,
      pickingTime
    } = this.state
    const containerStyle = new Style(styles, 'container').addResolved(className)

    const initialDate = value || new Date()
    const date = this.getInternalDate()
    const dateTime = new DateTime(date)
    
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    const daysFromPreviousMonth = firstDayOfMonth.getDay()
    const lastDayFromPreviousMonth = new Date(date.getFullYear(), date.getMonth(), 0)
    const numWeeks = Math.ceil((lastDayOfMonth.getDate() - firstDayOfMonth.getDate() + 1 + daysFromPreviousMonth) / 7)

    let day = 1
    let rows = []

    for (let week = 0; week < numWeeks; week++) {
      let days = []

      for (let weekDay = 1; weekDay <= 7; weekDay++) {
        if (week == 0 && weekDay <= daysFromPreviousMonth) {
          days.push(this.renderDay(lastDayFromPreviousMonth.getDate() - daysFromPreviousMonth + weekDay, -1))
        } else if (day > lastDayOfMonth.getDate()) {
          days.push(this.renderDay(day++ - lastDayFromPreviousMonth.getDate() + 1, 1))
        } else {
          days.push(this.renderDay(day++))
        }
      }

      rows.push(
        <tr>{days}</tr>
      )
    }

    return (
      <div class={containerStyle.getClasses()}>
        <div class={styles.head}>
          <button
            class={styles.arrow}
            onClick={this.handleMonthChange.bind(this, -1)}
            type="button"
          >←</button>

          <p class={styles['current-date']}>{dateTime.format('MMMM YYYY')}</p>

          <button
            class={styles.arrow}
            onClick={this.handleMonthChange.bind(this, 1)}
            type="button"
          >→</button>
        </div>

        <table class={styles.calendar}>
          <thead>
            <tr>
              <th class={styles['calendar-head']}>Su</th>
              <th class={styles['calendar-head']}>Mo</th>
              <th class={styles['calendar-head']}>Tu</th>
              <th class={styles['calendar-head']}>We</th>
              <th class={styles['calendar-head']}>Th</th>
              <th class={styles['calendar-head']}>Fr</th>
              <th class={styles['calendar-head']}>Sa</th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>

        <button
          class={styles['hours-launcher']}
          onClick={this.handleTimeToggle.bind(this)}
          type="button">{dateTime.format('HH:mm')}
        </button>

        {pickingTime && this.renderHours()}
      </div>
    )
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
    const {monthOffset} = this.state

    this.setState({
      monthOffset: monthOffset + change
    })
  }

  handleTimeToggle() {
    const {pickingTime} = this.state

    this.setState({
      pickingTime: !pickingTime
    })
  }

  renderDay(day, monthOffset) {
    const valueDate = this.props.date
    const date = this.getInternalDate({day}, monthOffset)
    const dateTime = new DateTime(date)
    const padedDay = day >= 10 ? day : `0${day}`

    const fadedDayStyle = new Style(styles, 'calendar-day')
      .addIf('calendar-day-faded', monthOffset !== undefined)
      .addIf('calendar-day-current', dateTime.isSameDayAs(new Date()))
      .addIf('calendar-day-active', dateTime.isSameDayAs(valueDate))

    return (
      <td>
        <button
          type="button"
          onClick={this.handleDatePick.bind(this, date)}
          class={fadedDayStyle.getClasses()}
        >{padedDay}</button>
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
        <li>
          <button
            class={styles.hour}
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
      <div class={styles['hours-container']}>
        <ul
          class={styles.hours}
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
