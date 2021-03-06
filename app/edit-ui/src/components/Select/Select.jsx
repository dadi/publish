import React, {useCallback} from 'react'
import {Checkbox} from '../..'
import classnames from '../../util/classnames'
import {ExpandMore} from '@material-ui/icons'
// import PropTypes from 'prop-types'
import styles from './Select.css'

// Select.propTypes = {}

// This isn't a bulletproof method for detecting devices with a touch screen,
// because there isn't one. Given that misidentifying a touch screen isn't a
// serious problem here – i.e. the user will get a non-optimal but still
// useable element – this should be good enough for us.
//
// Reference: http://www.stucox.com/blog/you-cant-detect-a-touchscreen/
const isTouchDevice = window.matchMedia('(pointer: coarse)').matches

const MAX_SELECT_ROWS = 8

export default function Select({
  className,
  disabled,
  multiple,
  name,
  onChange,
  options,
  readOnly,
  style,
  useNativeOnMobile = true,
  value
}) {
  // Always use native for single-option selection.
  const native = !multiple || (isTouchDevice && useNativeOnMobile)
  const containerClasses = classnames(
    styles.container,
    {
      [styles.disabled]: disabled,
      [styles.multiple]: multiple,
      [styles.readOnly]: readOnly
    },
    className
  )

  // Native, both single- and multiple-choice.
  if (native) {
    const selectedValue = options.find(option => option.selected)

    return (
      <div className={containerClasses} style={style}>
        <select
          className={styles.select}
          defaultValue={selectedValue && selectedValue.value}
          disabled={disabled || readOnly}
          multiple={multiple}
          name={name}
          onChange={onChange}
          size={
            multiple ? Math.min(options.length, MAX_SELECT_ROWS) : undefined
          }
          value={value}
        >
          {options.map(({disabled, label, value}) => (
            <option disabled={disabled} key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {!multiple && <ExpandMore className={styles.arrowIcon} />}
      </div>
    )
  }

  // Non-native, multiple-choice.
  const handleCheck = useCallback(
    ({target}) => {
      const newValue = target.checked
        ? [...value, target.id]
        : value.filter(item => item !== target.id)

      // This object imitates the relevant parts of the Event object to
      // keep the interface consistent with the native <select>.
      onChange({
        target: {
          attributes: {multiple: true},
          selectedOptions: newValue.map(value => ({value})),
          value: target.id
        }
      })
    },
    [onChange, value]
  )

  return (
    <div className={containerClasses} style={style}>
      {options.map(option => {
        return (
          <label
            className={classnames(styles.checkboxWrapper, {
              [styles.disabled]: disabled || option.disabled
            })}
            key={option.value}
          >
            <Checkbox
              checked={value.includes(option.value)}
              disabled={disabled || readOnly || option.disabled}
              id={option.value}
              onChange={handleCheck}
            />
            <div className={styles.label}>{option.label}</div>
          </label>
        )
      })}
    </div>
  )
}
