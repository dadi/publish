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

    this.state.optionsExpanded = false
    this.toggleExpandedStateHandler = event => {
      this.setState({
        optionsExpanded: false
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
      onClick,
      options,
      type
    } = this.props
    const {optionsExpanded} = this.state

    let launcherStyle = new Style(styles, 'launcher')

    launcherStyle.add(`launcher-${accent}`)
      .addIf('launcher-disabled', disabled)

    return (
      <div class={styles.container}>
        <Button
          accent={accent}
          disabled={disabled}
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
            direction={optionsExpanded ? 'down' : 'up'}
            width={10}
            height={6}
          />
        </Button>

        {optionsExpanded &&
          <div class={styles.options}>
            <Dropdown tooltip="right">
              {Object.keys(options).map(option => {
                return (
                  <DropdownItem onClick={options[option]}>{option}</DropdownItem>
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
      optionsExpanded: !this.state.optionsExpanded
    })
  }
}
