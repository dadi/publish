'use strict'

import { h, Component } from 'preact'

import Style from 'lib/Style'
import styles from './Button.css'

import Dropdown from 'components/Dropdown/Dropdown'
import DropdownItem from 'components/DropdownItem/DropdownItem'
import IconArrow from 'components/IconArrow/IconArrow'

export default class Button extends Component {
  static defaultProps = {
    type: 'button'
  }

  constructor(props) {
    super(props)

    this.optionsExpanded = false
  }

  render() {
    let buttonClass = new Style(styles, 'button')

    buttonClass.add(`button-${this.props.accent}`)
      .add(`button-in-group-${this.props.inGroup}`)

    return (
      <button type="button"
        class={buttonClass.getClasses()}
        onClick={this.props.onClick}
        type={this.props.type}
      >{this.props.children}</button>
    )
  }
}
