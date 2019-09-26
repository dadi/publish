import classnames from '../../util/classnames'
// import PropTypes from 'prop-types'
import React from 'react'
import styles from './Button.css'

// Button.propTypes = {}

export default React.forwardRef(function Button(
  {
    accent = 'positive',
    children,
    className,
    compact,
    disabled,
    filled,
    flat,
    isLoading, // To be implemented.
    mock,
    narrow,
    ...props
  },
  ref
) {
  const elementProps = {
    className: classnames(
      styles.button,
      {
        [styles['accent--' + accent]]: !disabled,
        // [styles['size--' + size]]: size,
        [styles.filled]: filled,
        [styles.flat]: flat,
        [styles.narrow]: narrow,
        [styles.compact]: compact,
        [styles.mock]: mock
      },
      className
    ),
    disabled,
    ref,
    ...props
  }

  if (mock) {
    return <span {...elementProps}>{children}</span>
  }

  return <button {...elementProps}>{children}</button>
})
