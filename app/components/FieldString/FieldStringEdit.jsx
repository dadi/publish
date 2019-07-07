import Button from 'components/Button/Button'
import Label from 'components/Label/Label'
import proptypes from 'prop-types'
import React from 'react'
import RichEditor from 'components/RichEditor/RichEditor'
import Style from 'lib/Style'
import styles from './FieldString.css'
import TextInput from 'components/TextInput/TextInput'

function getLink(value, displayDirective) {
  if (displayDirective && value) {
    if (typeof displayDirective === 'string') {
      return displayDirective.replace('{value}', value)
    }

    return /^https?:\/\//.test(value) ? value : 'http://' + value
  }

  return null
}

/**
 * Component for API fields of type String
 */
export default class FieldStringEdit extends React.Component {
  static propTypes = {
    /**
     * The schema of the collection being edited.
     */
    collection: proptypes.object,

    /**
     * The application configuration object.
     */
    config: proptypes.object,

    /**
     * The unique cache key for the document being edited.
     */
    contentKey: proptypes.string,

    /**
     * The human-friendly name of the field, to be displayed as a label.
     */
    displayName: proptypes.string,

    /**
     * If defined, contains an error message to be displayed by the field.
     */
    error: proptypes.string,

    /**
     * A metadata object associated with the value.
     */
    meta: proptypes.object,

    /**
     * The name of the field within the collection.
     */
    name: proptypes.string,

    /**
     * A callback to be fired whenever the value of the field changes. The
     * function will be called with the updated value as the first argument
     * and an optional error message as the second. This second argument gives
     * each field component the ability to perform their own validaton logic,
     * in addition to the central validation routine taking place upstream.
     */
    onChange: proptypes.func,

    /**
     * A callback to be fired whenever the field wants to update its value to
     * or from an error state. The function receives the name of the field, a
     * Boolean value indicating whether or not there's an error and finally the
     * new value of the field.
     */
    onError: proptypes.func,

    /**
     * A callback to be fired when the components mounts, in case it wishes to
     * register an `onSave` callback with the store. That callback is then
     * fired before the field is saved, allowing the function to modify its
     * value before it is persisted.
     */
    onSaveRegister: proptypes.func,

    /**
     * A callback to be fired when the components mounts, in case it wishes to
     * register an `onValidate` callback with the store. That callback is then
     * fired when the field is validated, overriding the default validation
     * method introduced by the API validator module.
     */
    onValidateRegister: proptypes.func,

    /**
     * Whether the field is read-only.
     */
    readOnly: proptypes.bool,

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
    value: proptypes.oneOfType([
      proptypes.arrayOf(proptypes.string),
      proptypes.object,
      proptypes.string
    ])
  }

  static defaultProps = {
    error: false,
    value: ''
  }

  constructor(props) {
    super(props)

    this.cursor = null
    this.dragBottomLimit = null
    this.dragStart = {}
    this.inputRefs = []
    this.itemRefs = []
    this.listContainerRef = null

    this.mousePositionListener = ({clientY: currentY}) => {
      this.setState({currentY})

      const {dragCurrentIndex: curr, dragOriginalIndex: orig} = this.state

      if (curr > 0) {
        const prevIndex = curr > orig ? curr : curr - 1
        const prevItem = this.itemRefs[prevIndex].getBoundingClientRect()

        if (prevItem.bottom - 5 > currentY) {
          this.setState({
            dragCurrentIndex: curr - 1
          })
        }
      }

      if (curr < this.props.value.length - 1) {
        const nextIndex = curr < orig ? curr : curr + 1
        const nextItem = this.itemRefs[nextIndex].getBoundingClientRect()

        if (nextItem.top + 5 < currentY) {
          this.setState({
            dragCurrentIndex: curr + 1
          })
        }
      }
    }

    this.dragEndListener = () => {
      // prettier-ignore
      window.document.removeEventListener('mousemove', this.mousePositionListener)
      window.document.removeEventListener('mouseup', this.dragEndListener)

      const {dragCurrentIndex, dragOriginalIndex} = this.state
      const {value: valueArray, onChange} = this.props

      if (dragCurrentIndex !== dragOriginalIndex) {
        const newValueArray = valueArray.slice()
        const [movedItem] = newValueArray.splice(dragOriginalIndex, 1)

        newValueArray.splice(dragCurrentIndex, 0, movedItem)

        typeof onChange === 'function' && onChange(newValueArray)
      }

      this.setState({dragCurrentIndex: null, dragOriginalIndex: null})
    }

    this.state = {
      currentY: null,
      dragCurrentIndex: null,
      dragOriginalIndex: null,
      focusIndex: null,
      hasFocus: false
    }
  }

  componentDidUpdate() {
    if (this.cursor) {
      this.setCursor(this.cursor)
      this.cursor = null
    }
  }

  getValueOfDropdown(element) {
    const selectedOptions = Array.from(
      element.selectedOptions,
      item => item.value
    )

    // If this isn't a multiple value select, we want to return the selected
    // value as a single element and not wrapped in a one-element array.
    if (element.attributes.multiple) {
      return selectedOptions
    }

    return selectedOptions[0]
  }

  handleDeleteRow(index) {
    const {onChange, value: oldValueArray} = this.props
    const newValueArray = oldValueArray.slice()

    if (typeof onChange !== 'function') return

    newValueArray.splice(index, 1)
    onChange(newValueArray)
  }

  handleDragStart(index, {clientY}) {
    const container = this.listContainerRef.getBoundingClientRect()
    const draggedItem = this.itemRefs[index].getBoundingClientRect()

    this.dragBottomLimit = container.height - draggedItem.height
    this.dragStart = {
      clientY,
      top: draggedItem.top - container.top,
      left: draggedItem.left - container.left,
      height: draggedItem.height,
      width: draggedItem.width
    }
    this.setState({
      dragOriginalIndex: index,
      dragCurrentIndex: index,
      currentY: clientY
    })

    window.document.addEventListener('mousemove', this.mousePositionListener)
    window.document.addEventListener('mouseup', this.dragEndListener)
  }

  handleFocusChange(hasFocus, focusIndex) {
    this.setState({
      hasFocus,
      focusIndex
    })
  }

  handleInputChange(value, options) {
    const {onChange, schema} = this.props

    if (typeof onChange !== 'function') return

    // We prefer sending a `null` over an empty string.
    onChange(value || null, options)

    if (!schema.publish || !schema.publish.options) {
      const {selectionStart, selectionEnd} = this.inputRefs[0]

      this.cursor = {selectionRange: [selectionStart, selectionEnd]}
    }
  }

  handleKeyDown(index, e) {
    const {
      onChange,
      schema: {publish = {}},
      value: valueArray
    } = this.props
    const {value, selectionStart, selectionEnd} = this.inputRefs[index]

    switch (e.key) {
      case 'Enter':
        if (
          // For multiline strings, this functionality is under Ctrl+Enter.
          (!publish.multiline || e.ctrlKey) &&
          Array.isArray(valueArray) &&
          index < valueArray.length &&
          typeof onChange === 'function'
        ) {
          // Add line break at cursor position, splitting the item in two.
          const updatedRowValue = value.slice(0, selectionStart)
          const addedRowValue = value.slice(selectionEnd)
          const newValueArray = [
            ...valueArray.slice(0, index),
            updatedRowValue,
            addedRowValue,
            ...valueArray.slice(index + 1)
          ]

          onChange(newValueArray)

          this.cursor = {index: index + 1, selectionRange: [0, 0]}
        }

        return

      case 'Backspace':
        if (
          selectionStart === 0 &&
          selectionEnd === 0 &&
          index < valueArray.length &&
          index > 0 &&
          typeof onChange === 'function'
        ) {
          // Necessary – otherwise removes last char of previous item.
          e.preventDefault()

          // Concatenate the item with the previous one.
          const prevItem = valueArray[index - 1] || ''
          const currItem = valueArray[index] || ''
          const newValueArray = [
            ...valueArray.slice(0, index - 1),
            prevItem + currItem,
            ...valueArray.slice(index + 1)
          ]

          onChange(newValueArray)

          this.cursor = {
            index: index - 1,
            selectionRange: [prevItem.length, prevItem.length]
          }
        } else if (index === valueArray.length) {
          e.preventDefault()

          this.setCursor({index: index - 1})
        }

        return

      case 'Delete':
        if (
          selectionStart === value.length &&
          selectionEnd === value.length &&
          index < valueArray.length - 1
        ) {
          // Necessary – otherwise removes first char of next item.
          e.preventDefault()

          // Concatenate the item with the next one.
          const currItem = valueArray[index] || ''
          const nextItem = valueArray[index + 1] || ''
          const newValueArray = [
            ...valueArray.slice(0, index),
            currItem + nextItem,
            ...valueArray.slice(index + 2)
          ]

          onChange(newValueArray)

          this.cursor = {
            index,
            selectionRange: [currItem.length, currItem.length]
          }
        }

        return

      case 'ArrowUp': {
        if (index > 0 && selectionStart === 0 && selectionEnd === 0) {
          e.preventDefault()

          this.setCursor({
            index: index - 1,
            selectionRange: [0, 0]
          })
        }

        return
      }

      case 'ArrowDown': {
        if (
          index < valueArray.length &&
          selectionStart === value.length &&
          selectionEnd === value.length
        ) {
          e.preventDefault()

          this.setCursor({
            index: index + 1,
            selectionRange: [0, 0]
          })
        }

        return
      }
    }
  }

  handleListInputChange(index, e) {
    const {onChange, value: oldValueArray} = this.props

    if (typeof onChange !== 'function') return

    const newValueArray = Array.isArray(oldValueArray)
      ? oldValueArray.slice()
      : []

    newValueArray.splice(index, 1, e.target.value)
    onChange(newValueArray)

    const {selectionStart, selectionEnd} = this.inputRefs[index]

    this.cursor = {index, selectionRange: [selectionStart, selectionEnd]}
  }

  render() {
    const {schema, value} = this.props
    const publishBlock = schema.publish

    if (publishBlock && publishBlock.options) {
      return this.renderAsDropdown()
    }

    if ((publishBlock && publishBlock.list) || Array.isArray(value)) {
      return this.renderAsList()
    }

    if (schema.format) {
      return this.renderAsRichEditor(schema.format)
    }

    return this.renderAsFreeInput()
  }

  renderAsDropdown() {
    const {
      comment,
      displayName,
      error,
      name,
      readOnly,
      required,
      schema,
      value
    } = this.props
    const publishBlock = schema.publish || {}
    const options = publishBlock.options
    const selectLabel = `Please select${schema.label ? ` ${schema.label}` : ''}`
    const multiple = publishBlock.multiple === true
    const dropdownStyle = new Style(styles, 'dropdown')
      .addIf('dropdown-error', error)
      .addIf('dropdown-multiple', multiple)

    let selectedValue = value || schema.default || ''

    if (multiple && !Array.isArray(selectedValue)) {
      selectedValue = [selectedValue]
    }

    return (
      <Label
        error={Boolean(error)}
        errorMessage={typeof error === 'string' ? error : null}
        label={displayName}
        comment={
          comment ||
          (required && 'Required') ||
          (readOnly && 'Read only') ||
          null
        }
      >
        <select
          className={dropdownStyle.getClasses()}
          disabled={readOnly}
          onChange={el =>
            this.handleInputChange(this.getValueOfDropdown(el.target))
          }
          multiple={multiple}
          name={name}
          ref={this.selectDropdownOptions.bind(this, multiple)}
          value={selectedValue}
        >
          {!multiple && (
            <option className={styles['dropdown-option']} disabled value="">
              {selectLabel}
            </option>
          )}

          {options.map(option => {
            return (
              <option
                className={styles['dropdown-option']}
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
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
    const {
      display = {},
      heightType,
      multiline,
      readonly,
      resizable,
      rows
    } = publishBlock
    const type = multiline ? 'multiline' : 'text'
    const readOnly = readonly === true

    const link = getLink(value, display.link)

    return (
      <Label
        error={Boolean(error)}
        errorMessage={typeof error === 'string' ? error : null}
        hasFocus={hasFocus}
        label={displayName}
        comment={
          comment ||
          (required && 'Required') ||
          (readOnly && 'Read only') ||
          null
        }
      >
        <TextInput
          heightType={heightType}
          inputRef={ref => {
            this.inputRefs[0] = ref
          }}
          name={name}
          onBlur={this.handleFocusChange.bind(this, false)}
          onFocus={this.handleFocusChange.bind(this, true)}
          onInput={el => this.handleInputChange(el.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          resizable={resizable}
          rows={rows}
          type={type}
          value={value}
        />

        {link && (
          <Button
            accent="neutral"
            className={styles['link-preview']}
            href={link}
            openInNewWindow={true}
            size="small"
          >
            Open in new window
          </Button>
        )}
      </Label>
    )
  }

  renderAsList() {
    const {
      comment,
      displayName,
      error,
      name,
      placeholder,
      required,
      schema: {publish: publishBlock = {}},
      value
    } = this.props
    const {
      currentY,
      dragCurrentIndex,
      dragOriginalIndex,
      focusIndex,
      hasFocus
    } = this.state
    const {dragStart, dragBottomLimit} = this
    const {display = {}, multiline, readonly, resizable, rows} = publishBlock
    const type = multiline ? 'multiline' : 'text'
    const readOnly = readonly === true

    const top = dragStart.top + currentY - dragStart.clientY
    const draggedStyle = {
      top: `${Math.min(dragBottomLimit, Math.max(0, top))}px`,
      left: `${dragStart.left}px`,
      height: `${dragStart.height}px`,
      width: `${dragStart.width}px`
    }

    const renderItems =
      value &&
      value.map((itemValue, index) => {
        const link = getLink(itemValue, display.link)
        const itemStyles = new Style(styles, 'list-item')
          .addIf('dragged', dragOriginalIndex === index)
          .addIf('focused', focusIndex === index)

        return (
          <div
            className={itemStyles.getClasses()}
            key={index}
            onBlur={() => this.setState({focusIndex: null})}
            onFocus={() => this.setState({focusIndex: index})}
            ref={ref => {
              this.itemRefs[index] = ref
            }}
            style={dragOriginalIndex === index ? draggedStyle : {}}
          >
            <span
              className={styles['icon-drag']}
              onMouseDown={this.handleDragStart.bind(this, index)}
            >
              Drag
            </span>

            <TextInput
              heightType="content"
              inputRef={ref => {
                this.inputRefs[index] = ref
              }}
              name={name}
              onBlur={this.handleFocusChange.bind(this, false)}
              onFocus={this.handleFocusChange.bind(this, true)}
              onInput={this.handleListInputChange.bind(this, index)}
              onKeyDown={this.handleKeyDown.bind(this, index)}
              placeholder={placeholder}
              readOnly={readOnly}
              resizable={resizable}
              rows={rows}
              type={type}
              value={itemValue}
            />

            {link && (
              <Button
                accent="neutral"
                className={styles['link-preview']}
                href={link}
                openInNewWindow={true}
                size="small"
              >
                Open in new window
              </Button>
            )}

            <Button
              accent="destruct"
              className={styles['remove-button']}
              onClick={this.handleDeleteRow.bind(this, index)}
              size="small"
            >
              Remove
            </Button>
          </div>
        )
      })

    if (renderItems && dragCurrentIndex !== null) {
      renderItems.splice(
        dragCurrentIndex + Number(dragCurrentIndex > dragOriginalIndex),
        0,
        <div
          className={styles['drag-placeholder']}
          key="placeholder"
          style={{height: dragStart.height}}
        />
      )
    }

    return (
      <Label
        comment={
          comment ||
          (required && 'Required') ||
          (readOnly && 'Read only') ||
          null
        }
        error={Boolean(error)}
        errorMessage={typeof error === 'string' ? error : null}
        hasFocus={hasFocus}
        label={displayName}
      >
        {value && (
          <div
            className={styles['list-container']}
            ref={ref => {
              this.listContainerRef = ref
            }}
          >
            {renderItems}
          </div>
        )}
        <div className={styles['list-item']}>
          <span className={styles['icon-add']}>Add</span>
          <TextInput
            heightType="content"
            inputRef={ref => {
              this.inputRefs[value.length] = ref
            }}
            name={name}
            onBlur={this.handleFocusChange.bind(this, false)}
            onFocus={this.handleFocusChange.bind(this, true, value.length)}
            onInput={this.handleListInputChange.bind(this, value.length)}
            onKeyDown={this.handleKeyDown.bind(this, value.length)}
            placeholder={placeholder}
            readOnly={readOnly}
            resizable={resizable}
            rows={rows}
            type={type}
            value={null}
          />
        </div>
      </Label>
    )
  }

  renderAsRichEditor(format) {
    const {
      contentKey,
      displayName,
      error,
      name,
      onSaveRegister,
      onValidateRegister,
      required,
      value
    } = this.props
    const {hasFocus} = this.state
    const fieldContentKey = JSON.stringify({
      fieldName: name
    })

    return (
      <Label
        comment={(required && 'Required') || null}
        error={Boolean(error)}
        errorMessage={typeof error === 'string' ? error : null}
        hasFocus={hasFocus}
        label={displayName}
      >
        <RichEditor
          contentKey={contentKey + fieldContentKey}
          format={format}
          onBlur={this.handleFocusChange.bind(this, false)}
          onChange={this.handleInputChange.bind(this)}
          onFocus={this.handleFocusChange.bind(this, true)}
          onSaveRegister={onSaveRegister}
          onValidateRegister={onValidateRegister}
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

  setCursor({index, selectionRange} = {}) {
    typeof index === 'number' && this.inputRefs[index].focus()
    selectionRange &&
      this.inputRefs[index || 0].setSelectionRange(...selectionRange)
  }
}
