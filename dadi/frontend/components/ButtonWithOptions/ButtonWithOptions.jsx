'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './ButtonWithOptions.css'

import Button from 'components/Button/Button'
import Dropdown from 'components/Dropdown/Dropdown'
import DropdownItem from 'components/DropdownItem/DropdownItem'
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
    type: proptypes.oneOf(['button', 'submit']),

    /**
     * The text to be rendered inside the main button.
     */
    children: proptypes.node
  }

  static defaultProps = {
    type: 'button'
  }

  constructor(props) {
    super(props)

    this.optionsExpanded = false
  }

  componentDidMount() {
    document.body.addEventListener('click', event => {
      this.setState({
        optionsExpanded: false
      })
    })
  }

  render() {
    let launcherClass = new Style(styles, 'button', 'button-border-right')

    launcherClass.add('options-launcher')
      .add(`options-launcher-${this.props.accent}`)

    return (
      <div class={styles.container}>
        <Button
          accent={this.props.accent}
          inGroup="left"
          onClick={this.props.onClick}
          type={this.props.type}
        >
          {this.props.children}
        </Button>

        <Button
          accent={`${this.props.accent}-shade-1`}
          inGroup="right"
          onClick={this.toggleOptions.bind(this)}
        >
          <IconArrow
            direction={this.state.optionsExpanded ? 'down' : null}
            width="10"
            height="10"
          />
        </Button>

        {this.state.optionsExpanded &&
          <div class={styles['options-container']}>
            <Dropdown>
              {Object.keys(this.props.options).map(option => {
                return (
                  <DropdownItem>{option}</DropdownItem>
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
