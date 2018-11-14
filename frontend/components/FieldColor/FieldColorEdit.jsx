'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './FieldColor.css'

import ColorPicker from 'components/ColorPicker/ColorPicker'
import Label from 'components/Label/Label'
import TextInput from 'components/TextInput/TextInput'

/**
 * Component for API fields of type Color
 */
export default class FieldColorEdit extends Component {
  static propTypes = {
    /**
     * The name of the collection being edited, as per the URL.
     */
    collection: proptypes.string,

    /**
     * The text to be rendered on the top-right corner of the field.
     */
    comment: proptypes.string,

    /**
     * A subset of the app config containing data specific to this field type.
     */
    config: proptypes.object,

    /**
     * The schema of the API being used.
     */
    currentApi: proptypes.object,

    /**
     * The schema of the collection being edited.
     */
    currentCollection: proptypes.object,

    /**
     * The human-friendly name of the field, to be displayed as a label.
     */
    displayName: proptypes.string,

    /**
     * The ID of the document being edited.
     */
    documentId: proptypes.string,

    /**
     * If defined, contains an error message to be displayed by the field.
     */
    error: proptypes.string,

    /**
     * Whether the field should be validated as soon as it mounts, rather than
     * waiting for a change event.
     */
    forceValidation: proptypes.bool,

    /**
     * If defined, specifies a group where the current collection belongs.
     */
    group: proptypes.string,

    /**
     * The name of the field within the collection. May be a path using
     * dot-notation.
     */
    name: proptypes.string,

    /**
     * A callback to be fired whenever the field wants to update its value to
     * a successful state. The function receives the name of the field and the
     * new value as arguments.
     */
    onChange: proptypes.string,

    /**
     * A callback to be fired whenever the field wants to update its value to
     * or from an error state. The function receives the name of the field, a
     * Boolean value indicating whether or not there's an error and finally the
     * new value of the field.
     */
    onError: proptypes.string,

    /**
     * Whether the field is required.
     */
    required: proptypes.bool,

    /**
     * The field schema.
     */
    schema: proptypes.object,

    /**
     * The field value.
     */
    value: proptypes.bool
  }

  constructor(props) {
    super(props)

    this.state.pickerVisible = false

    this.picker = false
    this.pickerEventHandler = this.handlePickerClick.bind(this, true)
    this.pickerOutsideEventHandler = this.handlePickerClick.bind(this, false)
    this.losingFocusTimeout = null
    this.state.hasFocus = false
  }

  render() {
    let {
      comment,
      config,
      displayName,
      error, 
      name,
      required,
      schema, 
      value
    } = this.props
    const {hasFocus} = this.state
    const {pickerVisible} = this.state
    const publishBlock = schema.publish || {}

    return (
      <Label
        className={styles.label}
        error={error}
        errorMessage={typeof error === 'string' ? error : null}
        hasFocus={hasFocus}
        label={displayName}
        comment={comment || (required && 'Required') || (publishBlock.readonly && 'Read only')}
      > 
        <TextInput
          name={name}
          onBlur={this.handleFocus.bind(this, false)}
          onChange={this.handleChange.bind(this)}
          onFocus={this.handleFocus.bind(this, true)}
          readonly={publishBlock.readonly === true}
          type="text"
          value={value}
        />

        <div 
          class={styles.swatch}
          style={value ? `background-color:#${value}` : ''}
        />

        {pickerVisible &&
          <div ref={this.handlePickerRef.bind(this)}>
            <ColorPicker
              className={styles.picker}
              color={value}
              onChange={this.handlePickerChange.bind(this)}
              format={publishBlock.format || 'hex'}
            />
          </div>
        }
      </Label>
    )
  }

  componentDidMount() {
    window.addEventListener('click', this.pickerOutsideEventHandler)
  }

  componentWillUnmount() {
    if (this.picker) {
      this.picker.removeEventListener('click', this.pickerOutsideEventHandler)
    }

    clearTimeout(this.losingFocusTimeout)
  }

  handleChange(event) {
    const {
      config,
      name,
      onChange,
      schema,
      value
    } = this.props

    if (typeof onChange === 'function') {
      onChange.call(this, name, event.target.value)
    }
  }

  handleFocus(hasFocus) {
    const {pickerVisible} = this.state
    const {schema} = this.props

    const publishBlock = schema.publish || {}

    // Return from focus event so picker doesn't display
    if (publishBlock.readonly === true) {
      return
    }

    this.hasFocus = hasFocus

    this.setState({
      hasFocus
    })

    if (!pickerVisible) {
      this.setState({
        pickerVisible: true
      })
    }

    if (!hasFocus && pickerVisible) {
      // clearTimeout(this.losingFocusTimeout)

      // this.losingFocusTimeout = setTimeout(() => {
      //   this.setState({
      //     pickerVisible: true
      //   })
      // }, 200)
    }
  }

  handlePickerChange(newColor) {
    const {name, onChange, schema} = this.props

    if (typeof onChange === 'function') {
      onChange.call(this, name, newColor)
    }
  }

  handlePickerClick(insidePicker, event) {
    const {pickerVisible} = this.state

    if (insidePicker) {
      event.stopPropagation()

      //clearTimeout(this.losingFocusTimeout)
    } else {
      if (pickerVisible && !this.hasFocus) {
        this.setState({
          pickerVisible: false
        })
      }
    }
  }

  handlePickerRef(element) {
    if (this.picker) return

    element.addEventListener('click', this.pickerEventHandler)

    this.picker = element
  }
}
