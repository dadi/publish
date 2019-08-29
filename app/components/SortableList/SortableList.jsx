import Button from 'components/Button/Button'
import formatLink from 'lib/util/formatLink'
import React from 'react'
import Style from 'lib/Style'
import styles from './SortableList.css'
import TextInput from 'components/TextInput/TextInput'

export default class StringArray extends React.Component {
  constructor(props) {
    super(props)

    this.cursor = null
    this.dragBottomLimit = null
    this.dragStart = {}
    this.inputRefs = []
    this.itemRefs = []
    this.listContainerRef = null

    this.dragEndListener = this.dragEndListener.bind(this)
    this.mousePositionListener = this.mousePositionListener.bind(this)

    this.state = {
      currentY: null,
      dragCurrentIndex: null,
      dragOriginalIndex: null
    }
  }

  componentDidUpdate() {
    if (this.cursor) {
      this.setCursor(this.cursor)
      this.cursor = null
    }
  }

  dragEndListener() {
    // prettier-ignore
    window.document.removeEventListener('mousemove', this.mousePositionListener)
    window.document.removeEventListener('mouseup', this.dragEndListener)

    const {dragCurrentIndex, dragOriginalIndex} = this.state
    const {valuesArray, onChange} = this.props

    if (dragCurrentIndex !== dragOriginalIndex) {
      const newValuesArray = Array.from(valuesArray)
      const [movedItem] = newValuesArray.splice(dragOriginalIndex, 1)

      newValuesArray.splice(dragCurrentIndex, 0, movedItem)

      if (typeof onChange === 'function') {
        onChange(newValuesArray)
      }
    }

    this.setState({dragCurrentIndex: null, dragOriginalIndex: null})
  }

  handleDeleteRow(index) {
    const {onChange, valuesArray} = this.props
    const newValuesArray = Array.from(valuesArray)

    if (typeof onChange !== 'function') return

    newValuesArray.splice(index, 1)
    onChange(newValuesArray)
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

  handleInputChange(index, e) {
    const {onChange, valuesArray} = this.props

    if (typeof onChange !== 'function') return

    const newValuesArray = Array.isArray(valuesArray)
      ? Array.from(valuesArray)
      : []

    newValuesArray.splice(index, 1, e.target.value)
    onChange(newValuesArray)

    if (index === valuesArray.length) {
      this.cursor = {index}
    }
  }

  handleKeyDown(index, e) {
    const {onChange, publishSettings = {}, valuesArray} = this.props
    const {value, selectionStart, selectionEnd} = this.inputRefs[index]

    switch (e.key) {
      case 'Enter':
        if (
          // For multiline strings, this functionality is under Ctrl+Enter.
          (!publishSettings.multiline || e.ctrlKey) &&
          Array.isArray(valuesArray) &&
          index < valuesArray.length &&
          typeof onChange === 'function'
        ) {
          // Add line break at cursor position, splitting the item in two.
          const updatedRowValue = value.slice(0, selectionStart)
          const addedRowValue = value.slice(selectionEnd)
          const newValuesArray = [
            ...valuesArray.slice(0, index),
            updatedRowValue,
            addedRowValue,
            ...valuesArray.slice(index + 1)
          ]

          onChange(newValuesArray)

          this.cursor = {index: index + 1, selectionRange: [0, 0]}
        }

        return

      case 'Backspace':
        if (
          selectionStart === 0 &&
          selectionEnd === 0 &&
          index < valuesArray.length &&
          index > 0 &&
          typeof onChange === 'function'
        ) {
          // Necessary – otherwise removes last char of previous item.
          e.preventDefault()

          // Concatenate the item with the previous one.
          const prevItem = valuesArray[index - 1] || ''
          const currItem = valuesArray[index] || ''
          const newValuesArray = [
            ...valuesArray.slice(0, index - 1),
            prevItem + currItem,
            ...valuesArray.slice(index + 1)
          ]

          onChange(newValuesArray)

          this.cursor = {
            index: index - 1,
            selectionRange: [prevItem.length, prevItem.length]
          }
        } else if (index === valuesArray.length) {
          e.preventDefault()

          this.setCursor({index: index - 1})
        }

        return

      case 'Delete':
        if (
          selectionStart === value.length &&
          selectionEnd === value.length &&
          index < valuesArray.length - 1
        ) {
          // Necessary – otherwise removes first char of next item.
          e.preventDefault()

          // Concatenate the item with the next one.
          const currItem = valuesArray[index] || ''
          const nextItem = valuesArray[index + 1] || ''
          const newValuesArray = [
            ...valuesArray.slice(0, index),
            currItem + nextItem,
            ...valuesArray.slice(index + 2)
          ]

          onChange(newValuesArray)

          this.cursor = {
            index,
            selectionRange: [currItem.length, currItem.length]
          }
        }

        return

      case 'ArrowUp': {
        e.preventDefault()

        if (index > 0 && selectionStart === 0 && selectionEnd === 0) {
          this.setCursor({
            index: index - 1,
            selectionRange: [0, 0]
          })
        } else if (selectionStart !== selectionEnd) {
          this.setCursor({
            index,
            selectionRange: [selectionStart, selectionStart]
          })
        } else {
          this.setCursor({
            index,
            selectionRange: [0, 0]
          })
        }

        return
      }

      case 'ArrowDown': {
        e.preventDefault()

        if (
          index < valuesArray.length &&
          selectionStart === value.length &&
          selectionEnd === value.length
        ) {
          this.setCursor({
            index: index + 1,
            selectionRange: [0, 0]
          })
        } else if (selectionStart !== selectionEnd) {
          this.setCursor({
            index,
            selectionRange: [selectionEnd, selectionEnd]
          })
        } else {
          this.setCursor({
            index,
            selectionRange: [value.length, value.length]
          })
        }

        return
      }
    }
  }

  mousePositionListener({clientY: currentY}) {
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

    if (curr < this.props.valuesArray.length - 1) {
      const nextIndex = curr < orig ? curr : curr + 1
      const nextItem = this.itemRefs[nextIndex].getBoundingClientRect()

      if (nextItem.top + 5 < currentY) {
        this.setState({
          dragCurrentIndex: curr + 1
        })
      }
    }
  }

  render() {
    const {
      name,
      onBlur,
      onFocus,
      placeholder,
      publishSettings = {},
      valuesArray
    } = this.props
    const {currentY, dragCurrentIndex, dragOriginalIndex} = this.state
    const {dragStart, dragBottomLimit} = this
    const {display = {}, multiline, readonly, resizable, rows} = publishSettings
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
      valuesArray &&
      valuesArray.map((value, index) => {
        const link = formatLink(value, display.link)
        const itemStyles = new Style(styles, 'list-item').addIf(
          'dragged',
          dragOriginalIndex === index
        )

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
              onBlur={onBlur}
              onFocus={onFocus}
              onInput={this.handleInputChange.bind(this, index)}
              onKeyDown={this.handleKeyDown.bind(this, index)}
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
      <>
        {valuesArray && (
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
              this.inputRefs[valuesArray.length] = ref
            }}
            name={name}
            onBlur={onBlur}
            onFocus={onFocus}
            onInput={this.handleInputChange.bind(this, valuesArray.length)}
            onKeyDown={this.handleKeyDown.bind(this, valuesArray.length)}
            placeholder={placeholder}
            readOnly={readOnly}
            resizable={resizable}
            rows={rows}
            type={type}
            value={null}
          />
        </div>
      </>
    )
  }

  setCursor({index, selectionRange} = {}) {
    if (typeof index === 'number') {
      this.inputRefs[index].focus()
    }

    if (selectionRange) {
      this.inputRefs[index || 0].setSelectionRange(...selectionRange)
    }
  }
}
