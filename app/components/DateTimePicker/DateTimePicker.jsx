import DateTime from 'lib/datetime'
import proptypes from 'prop-types'
import React from 'react'
import {Select} from '@dadi/edit-ui'
import Style from 'lib/Style'
import styles from './DateTimePicker.css'

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
    onChange: proptypes.func,

    /**
     * Whether to show the time picker.
     */
    showTimePicker: proptypes.bool
  }

  constructor(props) {
    super(props)

    this.TIME_PICKER_HOUR_SUBDIVISIONS = 2

    this.hoursContainerRef = null
    this.hoursRefs = []

    const displayDate = props.date
      ? new Date(props.date)
      : this.getInternalDate({
          hours: 0,
          minutes: 0
        })

    displayDate.setDate(1)

    this.state = {
      displayDate,
      monthOffset: 0
    }
  }

  componentWillReceiveProps(nextProps) {
    const {date} = this.props
    const {date: nextDate} = nextProps
    const {displayDate} = this.state

    let newState = null

    if (date && nextDate && date.getTime() !== nextDate.getTime()) {
      newState = {
        ...newState,
        monthOffset: 0
      }
    }

    if (nextDate && nextDate.getTime() !== displayDate.getTime()) {
      newState = {
        ...newState,
        displayDate: nextDate
      }
    }

    if (newState) {
      this.setState(newState)
    }
  }

  getInternalDate(overrides = {}) {
    const date = this.props.date || new Date()

    if (!new DateTime(date).isValid()) {
      return null
    }

    const newDate = new Date(date)

    if (overrides.year !== undefined) {
      newDate.setUTCFullYear(overrides.year)
    }

    if (overrides.month !== undefined) {
      newDate.setUTCMonth(overrides.month)
    }

    if (overrides.day !== undefined) {
      newDate.setUTCDate(overrides.day)
    }

    if (overrides.hours !== undefined) {
      newDate.setUTCHours(overrides.hours)
    }

    if (overrides.minutes !== undefined) {
      newDate.setUTCMinutes(overrides.minutes)
    }

    if (overrides.seconds !== undefined) {
      newDate.setUTCSeconds(overrides.seconds)
    }

    return newDate
  }

  handleDatePick(date) {
    const {onChange} = this.props

    if (typeof onChange === 'function') {
      onChange.call(this, date)
    }
  }

  handleMonthChange(change) {
    const {displayDate} = this.state
    const newDate = new Date(displayDate)

    newDate.setMonth(newDate.getMonth() + change)

    this.setState({
      displayDate: newDate
    })
  }

  render() {
    const {className, showTimePicker} = this.props
    const {displayDate} = this.state
    const containerStyle = new Style(styles, 'container').addResolved(className)
    const firstDayOfMonth = new Date(
      Date.UTC(displayDate.getUTCFullYear(), displayDate.getUTCMonth(), 1)
    )
    const lastDayOfMonth = new Date(
      Date.UTC(displayDate.getUTCFullYear(), displayDate.getUTCMonth() + 1, 0)
    )
    const daysFromPreviousMonth = firstDayOfMonth.getDay()
    const numWeeks = Math.ceil(
      (lastDayOfMonth.getDate() -
        firstDayOfMonth.getDate() +
        1 +
        daysFromPreviousMonth) /
        7
    )
    const displayDateTime = new DateTime(displayDate)
    const rows = []

    for (let week = 0; week < numWeeks; week++) {
      const days = []

      for (let weekDay = 1; weekDay <= 7; weekDay++) {
        days.push(this.renderDay(week * 7 + weekDay - daysFromPreviousMonth))
      }

      rows.push(<tr key={week}>{days}</tr>)
    }

    return (
      <div className={containerStyle.getClasses()}>
        <div className={styles.head}>
          <button
            className={`${styles['page-icon']} ${styles['page-icon-prev']}`}
            onClick={this.handleMonthChange.bind(this, -1)}
          >
            <i className="material-icons">expand_more</i>
          </button>

          <p className={styles['current-date']}>
            {displayDateTime.format('MMMM YYYY')}
          </p>

          <button
            className={`${styles['page-icon']} ${styles['page-icon-next']}`}
            onClick={this.handleMonthChange.bind(this, +1)}
          >
            <i className="material-icons">expand_more</i>
          </button>
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
          <tbody>{rows}</tbody>
        </table>

        {showTimePicker && this.renderHours(displayDateTime)}
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
        >
          {paddedDay}
        </button>
      </td>
    )
  }

  renderHours(displayDateTime) {
    const selectOptions = []
    const selectValues = []
    const currentTimeLabel = displayDateTime.format('HH:mm')

    let valueIndex = -1

    for (let i = 0; i < 24 * this.TIME_PICKER_HOUR_SUBDIVISIONS; i++) {
      const date = this.getInternalDate({
        hours: 0,
        minutes: i * 30,
        seconds: 0
      })
      const label = new DateTime(date).format('HH:mm')

      selectOptions.push({
        label,
        value: i
      })

      if (label === currentTimeLabel) {
        valueIndex = i
      }

      // `Select` can only hold string values, so we need to store the actual
      // Date objects in a separate array and then retrieve them by index.
      selectValues.push(date)
    }

    // If `valueIndex` is -1, it means the current time isn't one of the set
    // intervals (e.g. 19:43). In this case, we add that value as an option
    // to <Select>, and make it both selected and disabled.
    if (valueIndex === -1) {
      selectOptions.unshift({
        disabled: true,
        label: currentTimeLabel,
        value: valueIndex
      })
    }

    return (
      <Select
        className={styles['time-picker']}
        dir="up"
        onChange={e => this.handleDatePick(selectValues[e.target.value])}
        options={selectOptions}
        value={valueIndex}
      />
    )
  }
}
