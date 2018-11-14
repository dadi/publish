'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './ColorPicker.css'

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

    this.pickerVisible = false

    this.hsv = false

    this.hueElement = false
    this.hueElementHeight = false
    this.hueIndicator = false
    this.hueCoordinate = false
    this.hueOffset = 15
    
    this.paletteCoordinate = false
    this.paletteElement = false
    this.paletteIndicator = false
    this.paletteBackground = false
  }

  componentDidMount(){
    this.setInitial()
  }

  render() {
    const {className} = this.props
    const value = this.props.color
    const containerStyle = new Style(styles, 'container').addResolved(className)

    // Update hsv
    this.hsv = this.hex2hsv(this.props.color)

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

        <div
          class={styles.hue}
          ref={this.handleHueRef.bind(this)}
        >
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
    let paletteColor = this.hsv2rgb({ h: this.hsv.h, s: 1, v: 1 })
    this.paletteBackground = '#' + paletteColor.hex
    
    this.hueCoordinate = ((this.hsv.h % 360) * 200) / 360

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

    element.addEventListener('mousedown', event => { 
      mousedown = true 
    })
    element.addEventListener('mouseup',   event => { 
      mousedown = false 
    })
    element.addEventListener('mouseout',  event => { 
      mousedown = false 
    })
    element.addEventListener('mousemove', event => {
      if (mousedown) listener(event)
    })
  }

  mousePosition(event) {
    // ie
    if (window.event && window.event.contentOverflow !== undefined) {
      return { x: window.event.offsetX, y: window.event.offsetY }
    }
    // webkit
    if (event.offsetX !== undefined && event.offsetY !== undefined) {
      return { x: event.offsetX, y: event.offsetY }
    }
    // firefox
    let wrapper = event.target.parentNode.parentNode
    return { x: event.layerX - wrapper.offsetLeft, y: event.layerY - wrapper.offsetTop }
  }

  hueListener(event) {
    this.hueCoordinate = this.mousePosition(event).y
    
    this.hsv.h = this.hueCoordinate / this.hueElement.offsetHeight * 360 + this.hueOffset
    
    let paletteColor = this.hsv2rgb({ h: this.hsv.h, s: 1, v: 1 })
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
      onChange.call(this, this.hsv2hex(this.hsv))
    }
  }

  /**
   * Convert HSV representation to RGB HEX string.
   * Credits to http://www.raphaeljs.com
   */
  hsv2rgb(hsv) {
    let R
    let G
    let B
    let X
    let C
    let h = (hsv.h % 360) / 60
    
    C = hsv.v * hsv.s
    X = C * (1 - Math.abs(h % 2 - 1))
    R = G = B = hsv.v - C

    h = ~~h
    R += [C, X, 0, 0, X, C][h]
    G += [X, C, C, X, 0, 0][h]
    B += [0, 0, X, C, C, X][h]

    let r = Math.floor(R * 255)
    let g = Math.floor(G * 255)
    let b = Math.floor(B * 255)

    return { 
      r: r,
      g: g,
      b: b,
      hex: (16777216 | b | (g << 8) | (r << 16)).toString(16).slice(1)
    }
  }

  /**
   * Convert RGB representation to HSV.
   * r, g, b can be either in <0,1> range or <0,255> range.
   * Credits to http://www.raphaeljs.com
   */
  rgb2hsv(rgb) {
    let r = rgb.r
    let g = rgb.g
    let b = rgb.b
    
    if (rgb.r > 1 || rgb.g > 1 || rgb.b > 1) {
        r /= 255
        g /= 255
        b /= 255
    }

    let H, S, V, C
    V = Math.max(r, g, b)
    C = V - Math.min(r, g, b)
    H = (C == 0 ? null :
         V == r ? (g - b) / C + (g < b ? 6 : 0) :
         V == g ? (b - r) / C + 2 :
                  (r - g) / C + 4)
    H = (H % 6) * 60
    S = C == 0 ? 0 : C / V
    return { h: H, s: S, v: V }
  }

  hsv2hex(hsv) {
    return this.hsv2rgb(hsv).hex
  }
  
  rgb2hex(rgb) {
    return this.hsv2rgb(this.rgb2hsv(rgb)).hex
  }
  
  hex2hsv(hex) {
    return this.rgb2hsv(this.hex2rgb(hex))
  }
  
  hex2rgb(hex) {
    return {
      r: parseInt(hex.substr(0, 2), 16),
      g: parseInt(hex.substr(2, 2), 16),
      b: parseInt(hex.substr(4, 2), 16)
    }
  }
}
