import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import classnames from '../../util/classnames'
// import PropTypes from 'prop-types'
import styles from './Select.css'

// Select.propTypes = {}

export default function Select({
  className,
  dir = 'down',
  label,
  options,
  style
}) {
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

  const modifiedOptions = useMemo(
    () =>
      options.map(({label, onClick}) => ({
        label,
        onClick: () => {
          setIsOpen(false)
          onClick()
        }
      })),
    [options]
  )

  const containerRef = useRef()

  const optionsHtml = modifiedOptions.map(({label, onClick}, index) => (
    <div className={styles.option} key={label + index} onClick={onClick}>
      {label}
    </div>
  ))

  return (
    <div
      className={classnames(
        styles.container,
        styles['dir--' + dir],
        {
          [styles.open]: isOpen
        },
        className
      )}
      ref={containerRef}
      style={style}
    >
      <div className={styles.select} onClick={toggleOptions}>
        {label}
        <i id={styles.arrowIcon} className="material-icons">
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
