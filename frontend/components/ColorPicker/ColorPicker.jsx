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

    const initialHsv = Color.hex2hsv(props.value)

    this.state.hsv = initialHsv
    this.state.huePosition = (initialHsv.h % 360) * 200 / 360
    this.state.paletteCoordinates = {
      x: initialHsv.s * 200,
      y: 200 - initialHsv.v * 200
    }

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

    // Attach palette events.
    this.elementPalette.addEventListener('mousedown', this.handleStartSettingPalette)
    this.elementPalette.addEventListener('mouseup', this.handleStopSettingPalette)
    this.elementPalette.addEventListener('mouseout', this.handleStopSettingPalette)
    this.elementPalette.addEventListener('mousemove', this.handleProcessPalette)
  }

  componentWillUnmount() {
    // Remove hue events.
    this.elementHue.removeEventListener('mousedown', this.handleStartSettingHue)
    this.elementHue.removeEventListener('mouseup', this.handleStopSettingHue)
    this.elementHue.removeEventListener('mouseout', this.handleStopSettingHue)
    this.elementHue.removeEventListener('mousemove', this.handleProcessHue)

    // Remove palette events.
    this.elementPalette.removeEventListener('mousedown', this.handleStartSettingPalette)
    this.elementPalette.removeEventListener('mouseup', this.handleStopSettingPalette)
    this.elementPalette.removeEventListener('mouseout', this.handleStopSettingPalette)
    this.elementPalette.removeEventListener('mousemove', this.handleProcessPalette)
  }

  handleHueChange(event) {
    const {onChange} = this.props
    const {hsv} = this.state
    const newHuePosition = this.normalisePosition(event).y
    const newHsv = {
      ...hsv,
      h: newHuePosition / this.elementHue.offsetHeight * 360
    }

    this.setState({
      huePosition: newHuePosition,
      hsv: newHsv
    })

    if (typeof onChange === 'function') {
      onChange.call(this, Color.hsv2hex(newHsv))
    }
  }

  handlePaletteChange(event) {
    const {onChange} = this.props
    const {hsv} = this.state
    const {
      offsetHeight: height,
      offsetWidth: width
    } = this.elementPalette
    const newPaletteCoordinates = this.normalisePosition(event)
    const newHsv = {
      ...hsv,
      s: newPaletteCoordinates.x / width,
      v: (height - newPaletteCoordinates.y) / height
    }

    this.setState({
      hsv: newHsv,
      paletteCoordinates: newPaletteCoordinates
    })

    if (typeof onChange === 'function') {
      onChange.call(this, Color.hsv2hex(newHsv))
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
    const {
      hsv,
      huePosition,
      paletteCoordinates
    } = this.state
    const containerStyle = new Style(styles, 'container')
      .addResolved(className)
    const paletteBackgroundColor = Color.hsv2rgb({
      h: hsv.h,
      s: 1,
      v: 1
    }).hex

    return (
      <div class={containerStyle.getClasses()}>
        <div
          class={styles.palette}
          ref={el => this.elementPalette = el}
          style={{backgroundColor: `#${paletteBackgroundColor}`}}
        >
          <div
            class={styles.picker}
            ref={el => this.elementPaletteIndicator = el}
            style={{
              backgroundColor: `#${value}`,
              top: paletteCoordinates.y,
              left: paletteCoordinates.x
            }}
          />
        </div>

        <div
          class={styles.hue}
          ref={el => this.elementHue = el}
        >
          <div
            class={styles.slider}
            ref={el => this.elementHueIndicator = el}
            style={{top: huePosition}}
          />
        </div>
      </div>
    )
  }
}
