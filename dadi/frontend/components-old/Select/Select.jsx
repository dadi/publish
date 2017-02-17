'use strict'

import { h, Component } from 'preact'

export default class Select extends Component {
  constructor(props) {
    super(props)
    this.bindFunctions()
    this.setInitialState()
  }

  bindFunctions() {
    this.setInitialState = this.setInitialState.bind(this)
    this.filterOptions = this.filterOptions.bind(this)
    this.compose = this.compose.bind(this)
    this.onFocus = this.onFocus.bind(this)
    this.onBlur = this.onBlur.bind(this)
    this.onSelect = this.onSelect.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
    this.onKeyUp = this.onKeyUp.bind(this)
    this.onChange = this.onChange.bind(this)
    this.renderMenu = this.renderMenu.bind(this)
  }

  setInitialState() {
    const { open, options, value } = this.props
    let maxSuggestions = this.props.maxSuggestions || 5
    const visibleOptions = this.filterOptions(value, options, maxSuggestions)

    this.setState({
      open,
      value,
      visibleOptions,
      maxSuggestions,
      position: 0
    })
  }

  compose(e, ...events) {
    events.forEach(event => {
      if (typeof event === 'function') {
        event(e)
      }
    })
  }

  onFocus(e) {
    this.setState({
      ...this.state,
      open: true
    })
  }

  onBlur(e) {
    setTimeout(() => {
      this.setState({
        ...this.state,
        open: false
      })
    }, 100)
  }

  onKeyDown(e) {
    const { position, visibleOptions } = this.state
    const incrementedPosition = position >= visibleOptions.length - 1 ? 0 : position + 1
    const decrementedPosition = position === 0 ? visibleOptions.length - 1 : position - 1

    switch (e.key) {
      case 'ArrowDown':
        return this.setState({
          ...this.state,
          position: incrementedPosition
        })

      case 'ArrowUp':
        return this.setState({
          ...this.state,
          position: decrementedPosition
        })

      case 'Enter':
        let option = visibleOptions[position]
        this.setState({
          ...this.state,
          value: option
        })
        if (typeof this.props.onChange === 'function') {
          this.props.onChange(option)
        }
        return
    }
  }

  onKeyUp(e) {
    const { position, visibleOptions } = this.state
    const { options } = this.props
    const value = e.target.value
    const filteredOptions = this.filterOptions(value, options)

    const newPosition = position >= filteredOptions.length - 1
      ? filteredOptions.length - 1
      : position

    this.setState({
      ...this.state,
      value,
      visibleOptions: filteredOptions,
      position: newPosition
    })
  }

  onChange(e) {
    //
  }

  onSelect(option) {
    const { visibleOptions } = this.state
    const newPosition = visibleOptions.indexOf(option)

    this.setState({
      ...this.state,
      open: false,
      value: option,
      position: newPosition
    })

    if (typeof this.props.onChange === 'function') {
      this.props.onChange(option)
    }
  }

  filterOptions(value, options, maxSuggestions) {
    const { searchable } = this.props
    const visibleOptions = (searchable && value && value.length > 0)
      ? options.filter(o => o.indexOf(value) > -1)
      : [].concat(options)

    maxSuggestions = maxSuggestions || this.state.maxSuggestions

    return !!searchable
      ? visibleOptions.splice(0, maxSuggestions || 10)
      : visibleOptions
  }

  renderMenu() {
    const { position, visibleOptions } = this.state
    const list = visibleOptions.map((cv, i) => {
      return position === i
        ? <li class="active" onClick={() => this.onSelect(cv)}>{cv}</li>
        : <li onClick={() => this.onSelect(cv)}>{cv}</li>
    })
    return (
      <ul class="menu">
        {list}
      </ul>
    )
  }

  render() {
    const { options, searchable } = this.props

    return (
      <div class="Select">
        <input
            autoComplete="off"
            onFocus={(e) => { this.compose(e, this.onFocus, this.props.onFocus) }}
            onBlur={(e) => { this.compose(e, this.onBlur, this.props.onBlur) }}
            onKeyDown={(e) => { this.compose(e, this.onKeyDown, this.props.onKeyDown) }}
            onKeyUp={(e) => { this.compose(e, this.onKeyUp, this.props.onKeyUp) }}
            onChange={(e) => { this.compose(e, this.onChange, this.props.onChange) }}
            // onClick={}
            value={this.props.value || this.state.value}
            readonly={!searchable} />
        {this.state.open && this.renderMenu()}
      </div>
    )
  }

}
