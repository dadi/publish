/**
 * Convert HSV representation to RGB HEX string.
 * Credits to raphaeljs
 */
function hsv2rgb(hsv) {
  let R, G, B, X, C
  let h = (hsv.h % 360) / 60

  C = hsv.v * hsv.s
  X = C * (1 - Math.abs((h % 2) - 1))
  R = hsv.v - C
  G = hsv.v - C
  B = hsv.v - C

  h = ~~h
  R += [C, X, 0, 0, X, C][h]
  G += [X, C, C, X, 0, 0][h]
  B += [0, 0, X, C, C, X][h]

  let r = Math.floor(R * 255)
  let g = Math.floor(G * 255)
  let b = Math.floor(B * 255)

  let hex = (16777216 | b | (g << 8) | (r << 16)).toString(16).slice(1)

  return {r, g, b, hex} // eslint-disable-line
}

module.exports.hsv2rgb = hsv2rgb

/**
 * Convert RGB representation to HSV.
 * r, g, b can be either in <0,1> range or <0,255> range.
 * Credits to raphaeljs
 */
function rgb2hsv(rgb) {
  let r = rgb.r
  let g = rgb.g
  let b = rgb.b

  if (rgb.r > 1 || rgb.g > 1 || rgb.b > 1) {
    r /= 255
    g /= 255
    b /= 255
  }

  let H, S, V, C

  /* eslint-disable */
  V = Math.max(r, g, b)
  C = V - Math.min(r, g, b)
  H =
    C == 0
      ? null
      : V == r
      ? (g - b) / C + (g < b ? 6 : 0)
      : V == g
      ? (b - r) / C + 2
      : (r - g) / C + 4
  H = (H % 6) * 60
  S = C == 0 ? 0 : C / V
  /* eslint-enable */

  return {h: H, s: S, v: V}
}

module.exports.rgb2hsv = rgb2hsv

module.exports.hsv2hex = function(hsv) {
  return hsv2rgb(hsv).hex
}

module.exports.rgb2hex = function(rgb) {
  return hsv2rgb(rgb2hsv(rgb)).hex
}

module.exports.hex2hsv = function(hex) {
  return rgb2hsv(hex2rgb(hex))
}

function hex2rgb(hex) {
  /* eslint-disable */
  return {
    r: parseInt(hex.substr(0, 2), 16),
    g: parseInt(hex.substr(2, 2), 16),
    b: parseInt(hex.substr(4, 2), 16)
  }
  /* eslint-enable */
}

module.exports.hex2rgb = hex2rgb
