import classnames from '../../util/classnames'
//import PropTypes from 'prop-types'
import React from 'react'
import styles from './Button.css'

// Button.propTypes = {
//   fillStyle: PropTypes.oneOf(['filled', 'hollow', 'inverted'])
// }

export default React.forwardRef(function Button(
  {
    accent = 'positive',
    children,
    className,
    compact,
    disabled,
    fillStyle = 'hollow',
    flat,
    href,
    isLoading, // To be implemented.
    narrow,
    openInNew,
    ...props
  },
  ref
) {
  const elementProps = {
    className: classnames(
      styles.button,
      {
        [styles['accent--' + accent]]: !disabled,
        [styles.flat]: flat,
        [styles.narrow]: narrow,
        [styles.compact]: compact
      },
      styles[fillStyle],
      className
    ),
    disabled,
    ref,
    ...props
  }

  if (href) {
    return (
      <a
        href={href}
        target={openInNew ? '_blank' : undefined}
        {...elementProps}
      >
        {children}
      </a>
    )
  } else if (props.onClick || props.type) {
    return <button {...elementProps}>{children}</button>
  }

  return <span {...elementProps}>{children}</span>
})
