'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './ButtonWithOptions.css'

import Button from 'components/Button/Button'
import Dropdown from 'components/Dropdown/Dropdown'
import DropdownItem from 'components/Dropdown/DropdownItem'
import IconArrow from 'components/IconArrow/IconArrow'

/**
 * A call-to-action button with a list of secondary options on a dropdown.
 */
export default class ButtonWithOptions extends Component {
  static propTypes = {
    /**
     * Colour accent.
     */
    accent: proptypes.oneOf(['system']),

    /**
     * The text to be rendered inside the main button.
     */
    children: proptypes.node,

    /**
     * Whether the button is disabled.
     */
    disabled: proptypes.bool,

    /**
     * When present, the button will be rendered as an `a` element with the given
     * href.
     */
    href: proptypes.string,

    /**
     * Callback to be executed when the main button is clicked.
     */
    onClick: proptypes.func,

    /**
     * Object containing the secondary options. Keys define the text of the option and values contain the click callbacks.
     *
     *  ```jsx
     *  <ButtonWithOptions
     *    onClick={this.mainCallback()}
     *    options={{
     *      'Save and continue': this.saveAndContinueCallback()
     *      'Save and go back': this.saveAndGoBackeCallback()
     *    }}
     *  >
     *    Save
     *  </ButtonWithOptions>
     *  ```
     */
    options: proptypes.object,

    /**
     * Type/function of the button
     */
    type: proptypes.oneOf(['button', 'submit'])
  }

  static defaultProps = {
    type: 'button'
  }

  constructor(props) {
    super(props)

    this.state.open = false
    this.toggleExpandedStateHandler = event => {
      this.setState({
        open: false
      })
    }
  }

  componentDidMount() {
    document.body.addEventListener('click', this.toggleExpandedStateHandler)
  }

  componentWillUnmount() {
    document.body.removeEventListener('click', this.toggleExpandedStateHandler)
  }

  render() {
    const {
      accent,
      children,
      disabled,
      href,
      onClick,
      options,
      type
    } = this.props
    const {open} = this.state

    const launcherStyle = new Style(styles, 'launcher')
      .add(`launcher-${accent}`)
      .addIf('launcher-disabled', disabled)

    return (
      <div class={styles.container}>
        <Button
          accent={accent}
          disabled={disabled}
          href={href}
          inGroup="left"
          onClick={onClick}
          type={type}
        >
          {children}
        </Button>

        <Button
          accent="inherit"
          disabled={disabled}
          className={launcherStyle.getClasses()}
          inGroup="right"
          onClick={this.toggleOptions.bind(this)}
        >
          <IconArrow
            direction={open ? 'down' : 'up'}
            width={10}
            height={6}
          />
        </Button>

        {open && !disabled &&
          <div class={styles.options}>
            <Dropdown tooltip="right">
              {options.map(option => {
                return (
                  <DropdownItem onClick={option.action}>{option.name}</DropdownItem>
                )
              })}
            </Dropdown>
          </div>
        }
        
      </div>
    )
  }

  toggleOptions(event) {
    event.stopPropagation()

    this.setState({
      open: !this.state.open
    })
  }
}
