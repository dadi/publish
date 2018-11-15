'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './ColorPicker.css'

import Color from 'lib/color'

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
     * The Color string representing the currently selected value.
     */
    color: proptypes.string,

    /**
     * The format of the color string
     */
    format: proptypes.string,

    /**
     * A callback to be fired when a new date is selected.
     */
    onChange: proptypes.func
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

  componentDidMount() {
    this.setInitial()
  }

  render() {
    const {className} = this.props
    const value = this.props.color
    const containerStyle = new Style(styles, 'container').addResolved(className)

    // Update hsv
    this.hsv = Color.hex2hsv(this.props.color)

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
            ref={el => (this.paletteIndicator = el)}
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
            ref={el => (this.hueIndicator = el)}
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

    element.addEventListener('click', this.paletteListener.bind(this))
    this.enableDragging(element, this.paletteListener.bind(this))
  }

  handleHueRef(element) {
    if (this.hueElement) return
    this.hueElement = element

    element.addEventListener('click', this.hueListener.bind(this))
    this.enableDragging(element, this.hueListener.bind(this))
  }

  enableDragging(element, listener) {
    let mousedown = false

    element.addEventListener('mousedown', event => (mousedown = true))
    element.addEventListener('mouseup', event => (mousedown = false))
    element.addEventListener('mouseout', event => (mousedown = false))
    element.addEventListener('mousemove', event => {
      if (mousedown) listener(event)
    })
  }

  mousePosition(event) {
    // ie
    if (window.event && window.event.contentOverflow !== undefined) {
      return {x: window.event.offsetX, y: window.event.offsetY}
    }
    // webkit
    if (event.offsetX !== undefined && event.offsetY !== undefined) {
      return {x: event.offsetX, y: event.offsetY}
    }
    // firefox
    let wrapper = event.target.parentNode.parentNode
    return {x: event.layerX - wrapper.offsetLeft, y: event.layerY - wrapper.offsetTop}
  }

  hueListener(event) {
    this.hueCoordinate = this.mousePosition(event).y

    this.hsv.h = this.hueCoordinate / this.hueElement.offsetHeight * 360

    let paletteColor = Color.hsv2rgb({h: this.hsv.h, s: 1, v: 1})
    this.paletteBackground = '#' + paletteColor.hex

    this.handleColorPick()
  }

  paletteListener(event) {
    this.paletteCoordinate = this.mousePosition(event)

    let width = this.paletteElement.offsetWidth
    let height = this.paletteElement.offsetHeight

    this.hsv.s = this.paletteCoordinate.x / width
    this.hsv.v = (height - this.paletteCoordinate.y) / height

    this.handleColorPick()
  }

  handleColorPick() {
    const {onChange, color} = this.props

    if (typeof onChange === 'function') {
      onChange.call(this, Color.hsv2hex(this.hsv))
    }
  }
}
