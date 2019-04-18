'use strict'

import {h, Component} from 'preact'
import {route} from '@dadi/preact-router'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './FieldString.css'

import Button from 'components/Button/Button'
import Label from 'components/Label/Label'
import RichEditor from 'components/RichEditor/RichEditor'
import TextInput from 'components/TextInput/TextInput'

/**
 * Component for API fields of type String
 */
export default class FieldStringEdit extends Component {
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
    * A callback to be used to obtain the base URL for the given page, as
    * determined by the view.
    */
    onBuildBaseUrl: proptypes.func,

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
     * An optional string to display as placeholder text.
     */
    placeholder: proptypes.string,

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

  static defaultProps = {
    error: false,
    value: ''
  }

  constructor(props) {
    super(props)

    this.state.hasFocus = false
  }

  componentDidMount() {
    const {
      meta = {}
    } = this.props

    if (meta.image && typeof this.insertImageCallback === 'function') {
      this.insertImageCallback(
        meta.image.selection[0].url,
        meta.image.position
      )
    }
  }

  getValueOfDropdown(element) {
    let options = Array.prototype.slice.call(element.options)
    let value = options.filter(option => option.selected).map(option => option.value)

    // If this isn't a multiple value select, we want to return the selected
    // value as a single element and not wrapped in a one-element array.
    if (!element.attributes.multiple) {
      return value[0]
    }

    return value
  }

  handleFocusChange(hasFocus) {
    this.setState({
      hasFocus
    })
  }

  handleImageSelect(position) {
    const {
      documentId,
      name,
      onBuildBaseUrl
    } = this.props

    const selectImageUrl = onBuildBaseUrl({
      createNew: !Boolean(documentId),
      referenceFieldSelect: name,
      search: {
        position
      }
    })

    route(selectImageUrl)
  }  

  handleOnChange(value) {
    const {name, onChange} = this.props

    // We prefer sending a `null` over an empty string.
    let sanitisedValue = value === '' ? null : value

    if (typeof onChange === 'function') {
      onChange.call(this, name, sanitisedValue)
    }
  }

  render() {
    const {schema} = this.props
    const publishBlock = schema.publish

    if (publishBlock && publishBlock.options) {
      return this.renderAsDropdown()
    }

    if (schema.format) {
      return this.renderAsRichEditor(schema.format)
    }

    return this.renderAsFreeInput()
  }

  renderAsDropdown() {
    let {
      comment,
      displayName,
      error,
      name,
      required,
      schema,
      value
    } = this.props
    const publishBlock = schema.publish || {}
    const options = publishBlock.options
    const selectedValue = value || schema.default || null
    const selectLabel = `Please select${schema.label ? ` ${schema.label}` : ''}`
    const multiple = publishBlock.multiple === true
    const readOnly = publishBlock.readonly === true
    const dropdownStyle = new Style(styles, 'dropdown')
      .addIf('dropdown-error', error)
      .addIf('dropdown-multiple', multiple)

    return (
      <Label
        error={error}
        errorMessage={typeof error === 'string' ? error : null}
        label={displayName}
        comment={comment || (required && 'Required') || (readOnly && 'Read only')}
      >
        <select
          class={dropdownStyle.getClasses()}
          disabled={readOnly}
          onChange={el => this.handleOnChange(this.getValueOfDropdown(el.target))}
          multiple={multiple}
          name={name}
          ref={this.selectDropdownOptions.bind(this, multiple)}
          value={selectedValue}
        >
          {!multiple &&
            <option
              value=""
              class={styles['dropdown-option']}
              disabled
              selected={selectedValue === null}
            >{selectLabel}</option>
          }

          {options.map(option => {
            return (
              <option
                class={styles['dropdown-option']}
                value={option.value}
              >{option.label}</option>
            )
          })}
        </select>
      </Label>
    )
  }

  renderAsFreeInput() {
    const {
      comment,
      displayName,
      error,
      name,
      placeholder,
      required,
      schema,
      value
    } = this.props
    const {hasFocus} = this.state
    const publishBlock = schema.publish || {}
    const {heightType, rows, resizable} = publishBlock
    const type = publishBlock.multiline ? 'multiline' : 'text'
    const readOnly = publishBlock.readonly === true

    let link = publishBlock.display && publishBlock.display.link
    let linkFormatted = false

    if (link && typeof link === 'string') {
      linkFormatted = link.replace(/{value}/, value)
    }

    return (
      <Label
        error={error}
        errorMessage={typeof error === 'string' ? error : null}
        hasFocus={hasFocus}
        label={displayName}
        comment={comment || (required && 'Required') || (readOnly && 'Read only')}
      >
        <TextInput
          heightType={heightType}
          name={name}
          onBlur={this.handleFocusChange.bind(this, false)}
          onInput={el => this.handleOnChange(el.target.value)}
          onFocus={this.handleFocusChange.bind(this, true)}
          placeholder={placeholder}
          readonly={readOnly}
          resizable={resizable}
          rows={rows}
          type={type}
          value={value}
        />
        {link && (
          <Button
            accent="neutral"
            size="small"
            href={linkFormatted || value} 
            className={styles['link-preview']}
            openInNewWindow={true}
          >Open in new window</Button>
        )}
      </Label>
    )
  }

  renderAsRichEditor(format) {
    const {
      displayName,
      error,
      meta,
      name,
      placeholder,
      required,
      schema,
      value
    } = this.props
    const {hasFocus} = this.state
    
    return (
      <Label
        comment={required && 'Required'}
        error={error}
        errorMessage={typeof error === 'string' ? error : null}
        hasFocus={hasFocus}
        label={displayName}
      >
        <RichEditor
          format={format}
          insertImageCallback={callback => this.insertImageCallback = callback}
          onBlur={this.handleFocusChange.bind(this, false)}
          onChange={this.handleOnChange.bind(this)}
          onFocus={this.handleFocusChange.bind(this, true)}
          onImageInsert={this.handleImageSelect.bind(this)}
          value={value}
        />        
      </Label>
    )
  }

  selectDropdownOptions(isMultiple, input) {
    const {value} = this.props

    if (!input || !input.options || !isMultiple) return

    for (let i = 0; i < input.options.length; i++) {
      if (value.includes(input.options[i].value)) {
        input.options[i].selected = true
      }
    }
  }
}
