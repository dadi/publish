'use strict'

import { h, Component } from 'preact'

import { Style } from 'lib/util'
import styles from './ButtonWithOptions.css'

import Button from 'components/Button/Button'
import Dropdown from 'components/Dropdown/Dropdown'
import DropdownItem from 'components/DropdownItem/DropdownItem'
import IconArrow from 'components/IconArrow/IconArrow'

export default class ButtonWithOptions extends Component {
  constructor (props) {
    super(props)

    this.optionsExpanded = false
  }

  componentDidMount () {
    document.body.addEventListener('click', event => {
      this.setState({
        optionsExpanded: false
      })
    })
  }

  render () {
    let launcherClass = new Style(styles)

    launcherClass.add('button')
      .add('button-border-right')
      .add('options-launcher')
      .add(`options-launcher-${this.props.accent}`)

    return (
      <div class={styles.container}>
        <Button
          accent={this.props.accent}
          inGroup='left'
          onClick={this.props.onClick}
        >
          {this.props.children}
        </Button>

        <Button
          accent={`${this.props.accent}-shade-1`}
          inGroup='right'
          onClick={this.toggleOptions.bind(this)}
        >
          <IconArrow direction={this.state.optionsExpanded ? 'down' : null} />
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

  toggleOptions (event) {
    event.stopPropagation()

    this.setState({
      optionsExpanded: !this.state.optionsExpanded
    })
  }
}
