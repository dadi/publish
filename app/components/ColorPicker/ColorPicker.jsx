import React from 'react'
import proptypes from 'prop-types'

import Style from 'lib/Style'
import styles from './ColorPicker.css'

import Color from './util.js'

/**
 * Dialog for picking date and time for an input field.
 */
export default class ColorPicker extends React.Component {
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

    this.isSettingHue = false
    this.isSettingPalette = false

    this.handleStartSettingHue = () => {
      this.isSettingHue = true
    }
    this.handleStopSettingHue = () => {
      this.isSettingHue = false
    }
    this.handleProcessHue = event => {
      if (this.isSettingHue) {
        this.handleHueChange(event)
      }
    }
    this.handleStartSettingPalette = () => {
      this.isSettingPalette = true
    }
    this.handleStopSettingPalette = () => {
      this.isSettingPalette = false
    }
    this.handleProcessPalette = event => {
      if (this.isSettingPalette) {
        this.handlePaletteChange(event)

        event.preventDefault()
      }
    }
  }

  componentDidMount() {
    // Attach hue events.
    this.elementHue.addEventListener('mousedown', this.handleStartSettingHue)
    this.elementHue.addEventListener('mouseup', this.handleStopSettingHue)
    this.elementHue.addEventListener('mouseout', this.handleStopSettingHue)
    this.elementHue.addEventListener('mousemove', this.handleProcessHue)
    this.elementHue.addEventListener('touchstart', this.handleStartSettingHue)
    this.elementHue.addEventListener('touchend', this.handleStopSettingHue)
    this.elementHue.addEventListener('touchcancel', this.handleStopSettingHue)
    this.elementHue.addEventListener('touchmove', this.handleProcessHue)

    // Attach palette events.
    this.elementPalette.addEventListener(
      'mousedown',
      this.handleStartSettingPalette
    )
    this.elementPalette.addEventListener(
      'mouseup',
      this.handleStopSettingPalette
    )
    this.elementPalette.addEventListener(
      'mouseout',
      this.handleStopSettingPalette
    )
    this.elementPalette.addEventListener('mousemove', this.handleProcessPalette)
    this.elementPalette.addEventListener(
      'touchstart',
      this.handleStartSettingPalette
    )
    this.elementPalette.addEventListener(
      'touchend',
      this.handleStopSettingPalette
    )
    this.elementPalette.addEventListener(
      'touchcancel',
      this.handleStopSettingPalette
    )
    this.elementPalette.addEventListener('touchmove', this.handleProcessPalette)
  }

  componentWillUnmount() {
    // Remove hue events.
    this.elementHue.removeEventListener('mousedown', this.handleStartSettingHue)
    this.elementHue.removeEventListener('mouseup', this.handleStopSettingHue)
    this.elementHue.removeEventListener('mouseout', this.handleStopSettingHue)
    this.elementHue.removeEventListener('mousemove', this.handleProcessHue)
    this.elementHue.removeEventListener(
      'touchstart',
      this.handleStartSettingHue
    )
    this.elementHue.removeEventListener('touchend', this.handleStopSettingHue)
    this.elementHue.removeEventListener(
      'touchcancel',
      this.handleStopSettingHue
    )
    this.elementHue.removeEventListener('touchmove', this.handleProcessHue)

    // Remove palette events.
    this.elementPalette.removeEventListener(
      'mousedown',
      this.handleStartSettingPalette
    )
    this.elementPalette.removeEventListener(
      'mouseup',
      this.handleStopSettingPalette
    )
    this.elementPalette.removeEventListener(
      'mouseout',
      this.handleStopSettingPalette
    )
    this.elementPalette.removeEventListener(
      'mousemove',
      this.handleProcessPalette
    )
    this.elementPalette.removeEventListener(
      'touchstart',
      this.handleStartSettingPalette
    )
    this.elementPalette.removeEventListener(
      'touchend',
      this.handleStopSettingPalette
    )
    this.elementPalette.removeEventListener(
      'touchcancel',
      this.handleStopSettingPalette
    )
    this.elementPalette.removeEventListener(
      'touchmove',
      this.handleProcessPalette
    )
  }

  handleHueChange(event) {
    const {onChange, value} = this.props
    const huePosition = this.normalisePosition(event).y
    const hsv = {
      ...Color.hex2hsv(value),
      h: (huePosition / this.elementHue.offsetHeight) * 360
    }

    if (typeof onChange === 'function') {
      onChange.call(this, Color.hsv2hex(hsv))
    }
  }

  handlePaletteChange(event) {
    const {onChange, value} = this.props
    const {offsetHeight: height, offsetWidth: width} = this.elementPalette
    const paletteCoordinates = this.normalisePosition(event)
    const hsv = {
      ...Color.hex2hsv(value),
      s: paletteCoordinates.x / width,
      v: (height - paletteCoordinates.y) / height
    }

    if (typeof onChange === 'function') {
      onChange.call(this, Color.hsv2hex(hsv))
    }
  }

  normalisePosition(event) {
    // Handle touch events.
    if (~event.type.indexOf('touch')) {
      let touch = event.touches[0] || event.changedTouches[0]
      let rect = event.target.getBoundingClientRect()

      return {
        x: Math.round(touch.pageX - rect.left - window.scrollX),
        y: Math.round(touch.pageY - rect.top - window.scrollY)
      }
    }

    // Handle Internet Explorer event.
    if (window.event && window.event.contentOverflow !== undefined) {
      return {
        x: window.event.offsetX,
        y: window.event.offsetY
      }
    }

    // Handle WebKit event.
    if (event.offsetX !== undefined && event.offsetY !== undefined) {
      return {
        x: event.offsetX,
        y: event.offsetY
      }
    }

    // Handle Firefox event.
    let wrapper = event.target.parentNode.parentNode

    return {
      x: event.layerX - wrapper.offsetLeft,
      y: event.layerY - wrapper.offsetTop
    }
  }

  render() {
    const {className, value} = this.props
    const containerStyle = new Style(styles, 'container').addResolved(className)
    const valueHsv = Color.hex2hsv(value)
    const huePosition = ((valueHsv.h % 360) * 200) / 360
    const paletteBackgroundColor = Color.hsv2rgb({
      h: valueHsv.h,
      s: 1,
      v: 1
    }).hex
    const paletteCoordinates = {
      x: valueHsv.s * 200,
      y: 200 - valueHsv.v * 200
    }

    return (
      <div className={containerStyle.getClasses()}>
        <div
          className={styles.palette}
          ref={el => (this.elementPalette = el)}
          style={{backgroundColor: `#${paletteBackgroundColor}`}}
        >
          <div
            className={styles.picker}
            ref={el => (this.elementPaletteIndicator = el)}
            style={{
              backgroundColor: `#${value}`,
              top: paletteCoordinates.y,
              left: paletteCoordinates.x
            }}
          />
        </div>

        <div className={styles.hue} ref={el => (this.elementHue = el)}>
          <div
            className={styles.slider}
            ref={el => (this.elementHueIndicator = el)}
            style={{top: huePosition}}
          />
        </div>
      </div>
    )
  }
}
