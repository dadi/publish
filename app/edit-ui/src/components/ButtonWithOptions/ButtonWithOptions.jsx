import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import Button from '../Button/Button'
import classnames from '../../util/classnames'
// import PropTypes from 'prop-types'
import styles from './ButtonWithOptions.css'

// ButtonWithOptions.propTypes = {}

export default function ButtonWithOptions({
  className,
  options,
  children,
  onClick,
  style,
  ...props
}) {
  const accent = 'positive' // Possibility of supporting other accents later
  const top = true // Possibility of supporting dropdown opening at the bottom later

  const [isDropdownOpen, showDropdown] = useState(false)
  const toggleDropdown = () =>
    isDropdownOpen ? showDropdown(false) : showDropdown(true)

  const containerRef = useRef()
  const handleClickOut = useCallback(e => {
    if (containerRef.current && !containerRef.current.contains(e.target))
      showDropdown(false)
  }, [])

  useEffect(() => {
    if (isDropdownOpen) {
      window.addEventListener('mousedown', handleClickOut)
    } else {
      window.removeEventListener('mousedown', handleClickOut)
    }
  }, [isDropdownOpen])

  const modifiedOptions = useMemo(
    () =>
      options.map(({text, onClick}) => ({
        text,
        onClick: e => {
          showDropdown(false)
          onClick(e)
        }
      })),
    [options]
  )

  return (
    <div
      className={classnames(
        styles.container,
        styles['accent--' + accent],
        className
      )}
      style={style}
    >
      <Button
        accent={accent}
        className={classnames(styles.mainButton, {
          [styles.lift]: isDropdownOpen
        })}
        filled
        onClick={onClick}
        {...props}
      >
        {children}
      </Button>
      <div ref={containerRef}>
        <Button
          className={classnames(styles.sideButton, {
            [styles.lift]: isDropdownOpen
          })}
          filled
          onClick={toggleDropdown}
          {...props}
        >
          {(isDropdownOpen && !top) || (!isDropdownOpen && top) ? '▲' : '▼'}
        </Button>
        {isDropdownOpen && (
          <div className={classnames(styles.dropdown, {[styles.top]: top})}>
            {modifiedOptions.map(({text, onClick}, index) => (
              <div
                className={styles.dropdownItem}
                key={index}
                onClick={onClick}
              >
                {text}
              </div>
            ))}
            <div className={styles.filler} />
          </div>
        )}
      </div>
    </div>
  )
}
