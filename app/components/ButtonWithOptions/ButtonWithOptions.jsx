import Button from 'components/Button/Button'
import Dropdown from 'components/Dropdown/Dropdown'
import DropdownItem from 'components/Dropdown/DropdownItem'
import IconArrow from 'components/IconArrow/IconArrow'
import proptypes from 'prop-types'
import React from 'react'
import Style from 'lib/Style'
import styles from './ButtonWithOptions.css'

/**
 * A call-to-action button with a list of secondary options on a dropdown.
 */
export default class ButtonWithOptions extends React.Component {
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
     * The text to be rendered inside the main button.
     */
    children: proptypes.node,

    /**
     * Whether the button is disabled.
     */
    disabled: proptypes.bool,

    /**
     * When present, the button will be rendered as an `a` element with the
     * given href.
     */
    href: proptypes.string,

    /**
     * Whether to display a loading state.
     */
    isLoading: proptypes.bool,

    /**
     * Callback to be executed when the main button is clicked.
     */
    onClick: proptypes.func,

    /**
     * Object containing the secondary options. Keys define the text of the
     * option and values contain the click callbacks.
     *
     *  ```jsx
     *  <ButtonWithOptions
     *    onClick={this.mainCallback()}
     *    options={{
     *     'Save and continue': this.saveAndContinueCallback()
     *     'Save and go back': this.saveAndGoBackeCallback()
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

    this.state = {
      open: false
    }
    this.closeOptionsHandler = event => {
      if (
        this.wrapperElement &&
        !this.wrapperElement.contains(event.target) &&
        this.state.open
      ) {
        this.toggleOptions(false)
      }
    }
  }

  componentDidMount() {
    document.body.addEventListener('click', this.closeOptionsHandler)
  }

  componentWillUnmount() {
    document.body.removeEventListener('click', this.closeOptionsHandler)
  }

  handleOptionClick(callback) {
    callback()

    this.toggleOptions(false)
  }

  render() {
    const {
      accent,
      children,
      disabled,
      href,
      isLoading,
      onClick,
      options,
      type
    } = this.props
    const {open} = this.state
    const launcherStyle = new Style(styles, 'launcher')
      .add(`launcher-${accent}`)
      .addIf('launcher-disabled', disabled)

    return (
      <div className={styles.container} ref={el => (this.wrapperElement = el)}>
        <Button
          accent={accent}
          disabled={disabled}
          href={href}
          inGroup="left"
          isLoading={isLoading}
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
          onClick={this.toggleOptions.bind(this, null)}
        >
          <IconArrow direction={open ? 'down' : 'up'} height={6} width={10} />
        </Button>

        {open && !disabled && (
          <div className={styles.options}>
            <Dropdown tooltip="right">
              {Object.keys(options).map(option => {
                return (
                  <DropdownItem
                    key={option}
                    onClick={this.handleOptionClick.bind(this, options[option])}
                  >
                    {option}
                  </DropdownItem>
                )
              })}
            </Dropdown>
          </div>
        )}
      </div>
    )
  }

  toggleOptions(newValue) {
    const open = newValue === null ? !this.state.open : newValue

    this.setState({
      open
    })
  }
}
