'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './IconArrow.css'

/**
 * An arrow icon.
 */
export default class IconArrow extends Component {
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
     * A list of classes to be added to the icon element.
     */
    class: proptypes.string
  }

  static defaultProps = {
    class: null,
    direction: 'up',
    width: 10,
    height: 10
  }

  render() {
    const {direction} = this.props
    const width = parseInt(this.props.width)
    const height = parseInt(this.props.height)

    let borderWidths
    let borderColourPosition

    switch (this.props.direction) {
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

    const inlineStyle = `border-width: ${borderWidthsValue};border-color: ${borderColourValue};`

    let classes = [styles.icon]

    if (this.props.class) {
      classes.push(this.props.class)
    }
    
    return (
      <span class={classes.join(' ')} style={inlineStyle} />
    )
  }
}
