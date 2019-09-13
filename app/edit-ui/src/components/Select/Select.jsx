import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {Checkbox} from '../..'
import classnames from '../../util/classnames'
// import PropTypes from 'prop-types'
import styles from './Select.css'

// Select.propTypes = {}

const MAX_SELECT_ROWS = 8

export default function Select({
  className,
  dir = 'down',
  disabled,
  inFieldComponent,
  multiple,
  name,
  onChange,
  options,
  readOnly,
  style,
  useNativeOnMobile = true,
  value
}) {
  const mobile = false
  const native = mobile && useNativeOnMobile
  const [isOpen, setIsOpen] = useState(false)
  const containerClasses = classnames(
    styles.container,
    styles['dir--' + dir],
    {
      [styles.disabled]: disabled,
      [styles.inFieldComponent]: inFieldComponent,
      [styles.multiple]: multiple,
      [styles.native]: native,
      [styles.open]: isOpen,
      [styles.readOnly]: readOnly
    },
    className
  )

  // Native, both single- and multiple-choice.
  if (mobile && useNativeOnMobile) {
    return (
      <div className={containerClasses} style={style}>
        <select
          className={styles.select}
          disabled={disabled || readOnly}
          multiple={multiple}
          name={name}
          onChange={onChange}
          size={
            multiple ? Math.min(options.length, MAX_SELECT_ROWS) : undefined
          }
          value={value}
        >
          {options.map(({disabled, label, selected, value}) => (
            <option
              disabled={disabled}
              key={value}
              selected={selected}
              value={value}
            >
              {label}
            </option>
          ))}
        </select>
        {!multiple && (
          <i className={classnames('material-icons', styles.arrowIcon)}>
            expand_more
          </i>
        )}
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

  if (multiple) {
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

  // Non-native, single-choice.
  const toggleOptions = useCallback(
    () => !disabled && !readOnly && setIsOpen(!isOpen),
    [disabled, isOpen]
  )

  const handleClickOut = useCallback(e => {
    if (!containerRef.current.contains(e.target)) {
      setIsOpen(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) window.addEventListener('click', handleClickOut)

    return () => window.removeEventListener('click', handleClickOut)
  }, [isOpen])

  const mappedOptions = useMemo(
    () =>
      options.map(option => ({
        ...option,
        onClick: option.disabled
          ? undefined
          : () => {
              setIsOpen(false)
              // This object imitates the relevant parts of the Event object to
              // keep the interface consistent with the native <select>.
              onChange({
                target: {
                  attributes: {multiple: false},
                  selectedOptions: [{value: option.value}],
                  value: option.value
                }
              })
            }
      })),
    [options]
  )

  const containerRef = useRef()

  const optionsHtml = mappedOptions.map(({disabled, label, onClick, value}) => (
    <div
      className={classnames(styles.option, {
        [styles.disabledOption]: disabled
      })}
      key={value}
      onClick={onClick}
    >
      {label}
    </div>
  ))

  const {label} = options.find(option => option.value === value) || options[0]

  return (
    <div className={containerClasses} ref={containerRef} style={style}>
      <div className={styles.select} onClick={toggleOptions}>
        {label}
        <i className={classnames('material-icons', styles.arrowIcon)}>
          expand_more
        </i>
      </div>
      {/* The (invisible) `shadowOptions` element helps maintain width;
      without it, the width of the `select` element changes depending
      on the width of the selected label. */}
      <div className={styles.shadowOptions}>{optionsHtml}</div>
      {isOpen && <div className={styles.options}>{optionsHtml}</div>}
    </div>
  )
}
