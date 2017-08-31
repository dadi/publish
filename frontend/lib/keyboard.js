/* eslint-disable */
'use strict'

export class Keys {
  get keys () {
    let codes = {
      'backspace': 8,
      'tab': 9,
      'enter': 13,
      'shift': 16,
      'ctrl': 17,
      'alt': 18,
      'pause/break': 19,
      'caps lock': 20,
      'esc': 27,
      'space': 32,
      'page up': 33,
      'page down': 34,
      'end': 35,
      'home': 36,
      'left': 37,
      'up': 38,
      'right': 39,
      'down': 40,
      'insert': 45,
      'delete': 46,
      'command': 91,
      'left command': 91,
      'right command': 93,
      'numpad *': 106,
      'numpad +': 107,
      'numpad -': 109,
      'numpad .': 110,
      'numpad /': 111,
      'num lock': 144,
      'scroll lock': 145,
      'my computer': 182,
      'my calculator': 183,
      ';': 186,
      '=': 187,
      ',': 188,
      '-': 189,
      '.': 190,
      '/': 191,
      '`': 192,
      '[': 219,
      '\\': 220,
      ']': 221,
      "'": 222,
      // Alias
      'windows': 91,
      '⇧': 16,
      '⌥': 18,
      '⌃': 17,
      '⌘': 91,
      'ctl': 17,
      'control': 17,
      'option': 18,
      'pause': 19,
      'break': 19,
      'caps': 20,
      'return': 13,
      'escape': 27,
      'spc': 32,
      'pgup': 33,
      'pgdn': 34,
      'ins': 45,
      'del': 46,
      'cmd': 91
    }

    // Letters
    for (let i = 97; i < 123; i++) codes[String.fromCharCode(i)] = i - 32

    // Numbers
    for (let i = 48; i < 58; i++) codes[i - 48] = i

    // Function keys
    for (let i = 1; i < 13; i++) codes['f' + i] = i + 111

    // Numpad keys
    for (let i = 0; i < 10; i++) codes['numpad ' + i] = i + 96

    return codes
  }

  find (pattern) {
    return pattern
    .map(key => this.keys[key])
    .filter(key => key)
  }
}

export class Pattern {
  constructor (pattern, keys) {
    this.pattern = pattern
    this.keys = keys
    this.active = 0
  }

  next (keyCode) {
    if (!this.callback) return

    if (keyCode === this.keys[this.active]) {
      if (this.active < this.keys.length - 1) {
        this.active++

        return
      } else {
        this.callback({
          keys: this.keys,
          pattern: this.pattern
        })

        this.reset()

        return true
      }
    } else {
      this.reset()

      return
    }
  }

  reset () {
    this.active = 0
  }

  do (callback) {
    if (!callback || typeof callback !== 'function') {
      throw new Error('Invalid keyboard callback method')
    }
    this.callback = callback
  }
}

export class Keyboard extends Keys {
  constructor () {
    super()

    this.shortcuts = []
    this.listen()
  }

  listen () {
    // Bind required for `this` context in window events
    this.keydown = this.keydown.bind(this)
    this.keyup = this.keyup.bind(this)

    if (window && typeof window.addEventListener === 'function') {
      window.addEventListener('keydown', this.keydown)
      window.addEventListener('keyup', this.keyup)
    }
  }

  keydown (event) {
    if (event.keyCode) {
      // Find matching shortcut
      // trigger when pattern matches.
      // Return true if trigger successful
      const didTrigger = this.findShortcut(event.keyCode)
      if (didTrigger) {
        event.preventDefault()
      }
    }
  }

  keyup (event) {
    // Reset all patterns
    this.shortcuts.forEach(pattern => {
      pattern.reset()
    })

    event.preventDefault()
  }

  findShortcut (keyCode) {
    return this.shortcuts
      .find(shortcut => shortcut.next(keyCode))
  }

  on (pattern) {
    if (!pattern || typeof pattern !== 'string') {
      throw new Error('Invalid keyboard pattern')
    }
    const patternKeys = pattern.toLowerCase().split('+')
    const keys = this.find(patternKeys)
    // If one or more key is invalid, throw an error.
    if (patternKeys.length > keys.length) {
      throw new Error(`Invalid keyboard pattern`)
    }
    const shortcut = new Pattern(pattern, keys)

    this.shortcuts.push(shortcut)

    return shortcut
  }

  off () {
    if (window) {
      window.removeEventListener('keydown', this.keydown)
      window.removeEventListener('keyup', this.keyup)
    }
  }
}
