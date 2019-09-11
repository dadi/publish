import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import classnames from '../../util/classnames'
// import PropTypes from 'prop-types'
import styles from './Select.css'

// Select.propTypes = {}

export default function Select({
  className,
  dir = 'down',
  useNativeOnMobile = true,
  onChange,
  options,
  style,
  value
}) {
  const modifiedOnChange = useCallback(e => onChange(e.target.value), [
    onChange
  ])

  const mobile = false

  if (mobile && useNativeOnMobile) {
    return (
      <div
        className={classnames(
          styles.container,
          styles['dir--' + dir],
          {[styles.open]: isOpen},
          className,
          styles.native
        )}
        style={style}
      >
        <select
          className={styles.select}
          onChange={modifiedOnChange}
          value={value}
        >
          {options.map(({label, value}) => (
            <option value={value}>{label}</option>
          ))}
        </select>
        <i className={classnames('material-icons', styles.arrowIcon)}>
          expand_more
        </i>
      </div>
    )
  }

  const [isOpen, setIsOpen] = useState(false)
  const toggleOptions = useCallback(() => setIsOpen(!isOpen), [isOpen])

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
      options.map(({label, value}) => ({
        label,
        onClick: () => {
          setIsOpen(false)
          onChange(value)
        }
      })),
    [options]
  )

  const containerRef = useRef()

  const optionsHtml = mappedOptions.map(({label, onClick}, index) => (
    <div className={styles.option} key={label + index} onClick={onClick}>
      {label}
    </div>
  ))

  const {label} = options.find(option => option.value === value) || options[0]

  return (
    <div
      className={classnames(
        styles.container,
        styles['dir--' + dir],
        {[styles.open]: isOpen},
        className
      )}
      ref={containerRef}
      style={style}
    >
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
