import React from 'react'
import proptypes from 'prop-types'

import Style from 'lib/Style'
import styles from './Prompt.css'

import Button from 'components/Button/Button'

/**
 * A prompt dialog with a message and action button.
 */
export default class Prompt extends React.Component {
  static propTypes = {
    /**
     * Colour accent.
     */
    accent: proptypes.oneOf([
      'data',
      'destruct',
      'inherit',
      'neutral',
      'save',
      'system'
    ]),

    /**
     * The text to be displayed on the action button
     */
    action: proptypes.string.isRequired,

    /**
     * The child elements to be rendered next to the message.
     */
    children: proptypes.node,

    /**
     * Classes to append to the container element.
     */
    className: proptypes.string,

    /**
     * Callback to be executed when the button is clicked.
     */
    onClick: proptypes.func,

    /**
     * The position of the prompt tooltip.
     */
    position: proptypes.oneOf([
      'left',
      'right'
    ]),
  }

  static defaultProps = {
    accent: 'destruct',
    position: 'left'
  }

  render() {
    const {
      accent,
      action,
      children,
      className,
      onClick,
      position
    } = this.props
    const promptStyle = new Style(styles, 'container')
      .add(`container-${accent}`)
      .add(`container-${position}`)
      .addResolved(className)

    return (
      <div className={promptStyle.getClasses()}>
        {children}

        <div className={styles.action}>
          <Button
            accent="destruct"
            onClick={onClick}
            size="small"
          >{action}</Button>
        </div>
      </div>
    )
  }
}
