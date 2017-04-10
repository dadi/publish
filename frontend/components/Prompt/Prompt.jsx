'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './Prompt.css'

import Button from 'components/Button/Button'

/**
 * A prompt dialog with a message and action button.
 */
export default class Prompt extends Component {
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
      <div class={promptStyle.getClasses()}>
        {children}

        <div class={styles.action}>
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
