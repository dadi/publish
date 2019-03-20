'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'
import Style from 'lib/Style'
import styles from './TextInputWithSuggestions.css'
import TextInput from 'components/TextInput/TextInput'

const KEY_BACKSPACE = 8
const KEY_ESC = 27
const KEY_UP = 38
const KEY_DOWN = 40

/**
 * A TextInput with input suggestions.
 */
export default class TextInputWithSuggestions extends Component {
  static propTypes = {
    /**
     * Whether the list of suggestions is still being populated.
     */
    isLoading: proptypes.bool,

    /**
     * Callback function to fire whenever the value of the text input changes.
     */
    onChange: proptypes.func,

    /**
     * A hash map of the suggestions to display.
     */
    suggestions: proptypes.object,

    /**
     * The value of the input field.
     */
    value: proptypes.string
  }

  constructor(props) {
    super(props)

    this.defaultState = {
      focusedSuggestion: null,
      hasFocus: false
    }

    this.state = {...this.defaultState}
  }

  handleInputChange(event) {
    const {onChange} = this.props

    if (typeof onChange === 'function') {
      onChange.call(this, event.target.value)
    }
  }

  handleInputFocus(hasFocus) {
    this.setState({
      hasFocus,
    })
  }

  handleInputKeyDown(event) {
    const {suggestions, value} = this.props
    const {focusedSuggestion} = this.state
    const {keyCode: key} = event

    if (key === KEY_UP && focusedSuggestion > 0) {
      return this.setState(({focusedSuggestion}) => ({
        focusedSuggestion: focusedSuggestion - 1
      }))
    }

    const canKeyDown =
      focusedSuggestion < Object.keys(suggestions).length - 1
    
    if (key === KEY_DOWN && canKeyDown) {
      return this.setState(({focusedSuggestion}) => ({
        focusedSuggestion: focusedSuggestion + 1
      }))
    }
    
    if ((key === KEY_ESC || key === KEY_BACKSPACE) && !value) {
      console.log('!!! REMOVE FILTER')
      return
      //return this.removeFilter(this.filtersArray.length - 1, event)
    }
    
    if (key === KEY_ESC) {
      return this.setState({...this.defaultState})
    }
  }  

  render() {
    const {
      isLoading,
      suggestions,
      value
    } = this.props
    const {
      focusedSuggestion,
      hasFocus
    } = this.state
    const hasSuggestions = suggestions && Object.keys(suggestions).length > 0
    const inputStyle = new Style(styles, 'input')
      .addIf('input-loading', isLoading === true)

    return (
      <form>
        <TextInput
          className={inputStyle.getClasses()}
          onBlur={this.handleInputFocus.bind(this, false)}
          onFocus={this.handleInputFocus.bind(this, true)}
          onInput={this.handleInputChange.bind(this)}
          onKeyDown={this.handleInputKeyDown.bind(this)}
          placeholder={`Search`}
          value={value}
          tabindex="1"
        />

        {value && hasFocus && hasSuggestions &&
          <div class={styles.suggestions}>
            {Object.keys(suggestions).map((key, index) => {
              const suggestionStyle = new Style(styles, 'suggestion')
                .addIf('suggestion-selected', focusedSuggestion === index)

              return (
                <button
                  class={suggestionStyle.getClasses()}
                  //onClick={this.handleFilterSubmit.bind(this, fieldName)}
                  type="button"
                >{suggestions[key]}</button>
              )
            })}
          </div>
        }
      </form>
    )
  }
}
