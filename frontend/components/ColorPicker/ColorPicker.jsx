'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './ColorPicker.css'

import Color from './util.js'

/**
 * Dialog for picking date and time for an input field.
 */
export default class ColorPicker extends Component {
  static propTypes = {
    /**
     * Classes to append to the button element.
     */
    className: proptypes.string,

    /**
     * The format of the color string
     */
    format: proptypes.string,

    /**
     * A callback to be fired when a new date is selected.
     */
    onChange: proptypes.func,

    /**
     * The Color string representing the currently selected value.
     */
    value: proptypes.string
  }

  static defaultProps = {
    value: '000000'
  }  

  constructor(props) {
    super(props)

    this.hsv = false

    this.hueCoordinate = false
    this.hueElement = false
    this.hueElementHeight = false
    this.hueIndicator = false

    this.paletteBackground = false
    this.paletteCoordinate = false
    this.paletteElement = false
    this.paletteIndicator = false
  }

  componentWillUnmount() {
    // Removes all event listeners
    this.paletteElement.outerHTML = this.paletteElement.outerHTML
    this.hueElement.outerHTML = this.hueElement.outerHTML
  }

  render() {
    const {className, value} = this.props
    const containerStyle = new Style(styles, 'container').addResolved(className)

    // Update hsv
    this.hsv = Color.hex2hsv(value)

    // Set initial positions
    this.setInitial()

    return (
      <div class={containerStyle.getClasses()}>
        <div
          class={styles.palette}
          ref={this.handlePaletteRef.bind(this)}
          style={{backgroundColor: this.paletteBackground}}
        >
          <div
            class={styles.picker}
            ref={el => this.paletteIndicator = el}
            style={{
              backgroundColor: '#' + value,
              top: this.paletteCoordinate.y,
              left: this.paletteCoordinate.x
            }}
          />
        </div>

        <div class={styles.hue} ref={this.handleHueRef.bind(this)}>
          <div
            class={styles.slider}
            ref={el => this.hueIndicator = el}
            style={{top: this.hueCoordinate}}
          />
        </div>
      </div>
    )
  }

  setInitial() {
    let paletteColor = Color.hsv2rgb({h: this.hsv.h, s: 1, v: 1})
    this.paletteBackground = '#' + paletteColor.hex

    this.hueCoordinate = (this.hsv.h % 360) * 200 / 360

    this.paletteCoordinate = {
      x: this.hsv.s * 200,
      y: 200 - this.hsv.v * 200
    }
  }

  handlePaletteRef(element) {
    if (this.paletteElement) return
    this.paletteElement = element

    this.addPickerEvents(element, this.paletteListener.bind(this))
  }

  handleHueRef(element) {
    if (this.hueElement) return
    this.hueElement = element

    this.addPickerEvents(element, this.hueListener.bind(this))
  }

  addPickerEvents(element, listener) {
    let pressed = false

    element.addEventListener('click', listener)

    element.addEventListener('mousedown', () => pressed = true)
    element.addEventListener('mouseup', () => pressed = false)
    element.addEventListener('mouseout', () => pressed = false)
    element.addEventListener('mousemove', event => pressed && listener(event))

    element.addEventListener('touchstart', () => pressed = true)
    element.addEventListener('touchend', () => pressed = false)
    element.addEventListener('touchcancel', () => pressed = false)
    element.addEventListener('touchmove', event => {
      if (pressed) {
        event.preventDefault()
        listener(event)
      }
    })
  }

  hueListener(event) {
    this.hueCoordinate = this.normalisePosition(event).y

    this.hsv.h = this.hueCoordinate / this.hueElement.offsetHeight * 360

    let paletteColor = Color.hsv2rgb({h: this.hsv.h, s: 1, v: 1})
    this.paletteBackground = '#' + paletteColor.hex

    this.handleColorPick()
  }

  paletteListener(event) {
    this.paletteCoordinate = this.normalisePosition(event)

    let width = this.paletteElement.offsetWidth
    let height = this.paletteElement.offsetHeight

    this.hsv.s = this.paletteCoordinate.x / width
    this.hsv.v = (height - this.paletteCoordinate.y) / height

    this.handleColorPick()
  }
 
  normalisePosition(event) {
    // touch
    if (~event.type.indexOf('touch')) {    
      let touch = event.touches[0] || event.changedTouches[0]
      let rect = event.target.getBoundingClientRect()

      return {
        x: Math.round(touch.pageX - rect.left - window.scrollX),
        y: Math.round(touch.pageY - rect.top - window.scrollY)
      }
    }

    // ie
    if (window.event && window.event.contentOverflow !== undefined) {
      return {
        x: window.event.offsetX,
        y: window.event.offsetY
      }
    }

    // webkit
    if (event.offsetX !== undefined && event.offsetY !== undefined) {
      return {
        x: event.offsetX,
        y: event.offsetY
      }
    }

    // firefox
    let wrapper = event.target.parentNode.parentNode
    return {
      x: event.layerX - wrapper.offsetLeft,
      y: event.layerY - wrapper.offsetTop
    }
  }

  handleColorPick() {
    const {onChange} = this.props

    if (typeof onChange === 'function') {
      onChange.call(this, Color.hsv2hex(this.hsv))
    }
  }
}
