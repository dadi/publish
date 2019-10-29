import classnames from '../../util/classnames'
// import PropTypes from 'prop-types'
import React from 'react'
import styles from './Checkbox.css'

// Checkbox.propTypes = {}

export default function Checkbox({className, hovered, large, ...props}) {
  return (
    <input
      className={classnames(
        styles.checkbox,
        {
          [styles.checked]: props.checked,
          [styles.hovered]: hovered,
          [styles.large]: large
        },
        className
      )}
      {...props}
      type="checkbox"
    />
  )
}
