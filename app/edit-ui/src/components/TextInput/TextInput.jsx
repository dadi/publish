import React, {useCallback, useEffect, useRef} from 'react'
import classnames from '../../util/classnames'
// import PropTypes from 'prop-types'
import styles from './TextInput.css'

// TextInput.propTypes = {}

export default React.forwardRef(function TextInput(
  {
    accent,
    autoresize,
    className,
    error,
    multiline,
    inLabel: _,
    simple,
    readOnly,
    resizable,
    ...props
  },
  ref
) {
  if (!ref) {
    ref = useRef()
  }

  const value = props.value === null ? '' : props.value

  if (error) {
    accent = 'error'
  }

  // Resizing section.
  const maybeResize = useCallback(() => {
    if (autoresize && !resizable && ref.current) {
      ref.current.style.height = 'auto'
      ref.current.style.height = `${ref.current.scrollHeight + 2}px`
    }
  }, [autoresize, ref, resizable])

  useEffect(maybeResize, [value])

  // onChange handling section.
  const onChange = useCallback(
    e => {
      maybeResize()
      props.onChange(e)
    },
    [props.onChange]
  )

  // Render section.
  const modifiedProps = {
    className: classnames(
      styles.input,
      {
        [styles['accent--' + accent]]: accent && !readOnly,
        [styles.accent]: accent && !readOnly,
        [styles.readOnly]: readOnly,
        [styles.resizable]: resizable,
        [styles.simple]: simple
      },
      className
    ),
    readOnly,
    ref,
    rows: 10,
    ...props,
    onChange,
    value
  }

  return multiline ? (
    <textarea {...modifiedProps} />
  ) : (
    <input {...modifiedProps} />
  )
})
