'use strict'

import { h, Component } from 'preact'

import Style from 'lib/Style'
import styles from './ButtonWithOptions.css'

import Button from 'components/Button/Button'
import Dropdown from 'components/Dropdown/Dropdown'
import DropdownItem from 'components/DropdownItem/DropdownItem'
import IconArrow from 'components/IconArrow/IconArrow'

export default class ButtonWithOptions extends Component {
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
