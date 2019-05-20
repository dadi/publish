import React from 'react'
import proptypes from 'prop-types'

import Style from 'lib/Style'
import styles from './IconArrow.css'

/**
 * An arrow icon.
 */
export default class IconArrow extends React.Component {
  static propTypes = {
    /**
     * Colour accent.
     */
    direction: proptypes.oneOf(['down', 'left', 'right', 'up']),

    /**
     * The height of the arrow.
     */
    height: proptypes.number,

    /**
     * The width of the arrow.
     */
    width: proptypes.number,

    /**
     * A class to be added to the icon element.
     */
    className: proptypes.string
  }

  static defaultProps = {
    className: null,
    direction: 'up',
    width: 10,
    height: 10
  }

  render() {
    const {className, direction} = this.props
    const width = parseInt(this.props.width)
    const height = parseInt(this.props.height)

    let borderWidths
    let borderColourPosition

    switch (direction) {
      case 'up':
        borderWidths = [
          0, width / 2, height, width / 2
        ]
        borderColourPosition = 2

        break

      case 'down':
        borderWidths = [
          height, width / 2, 0, width / 2
        ]
        borderColourPosition = 0

        break

      case 'left':
        borderWidths = [
          height / 2, width, height / 2, 0
        ]
        borderColourPosition = 1

        break

      case 'right':
        borderWidths = [
          width / 2, 0, width / 2, height
        ]
        borderColourPosition = 3

        break
    }

    const borderWidthsValue = borderWidths.map(width => {
      return width + 'px'
    }).join(' ')

    const borderColourValue = [0, 1, 2, 3].map(index => {
      if (index === borderColourPosition) {
        return 'currentColor'
      }

      return 'transparent'
    }).join(' ')

    const inlineStyle = {
      borderColor: borderColourValue,
      borderWidth: borderWidthsValue
    }

    let classes = [styles.icon]

    if (className) {
      classes.push(className)
    }
    
    return (
      <span className={classes.join(' ')} style={inlineStyle} />
    )
  }
}
