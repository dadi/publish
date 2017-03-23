'use strict'

class Keys {
  get keys() {
    let codes = {
      '\'': 222,
      ',': 188,
      '-': 189,
      '.': 190,
      '/': 191,
      ';': 186,
      '=': 187,
      '[': 219,
      '\\': 220,
      ']': 221,
      '`': 192,
      'alt': 18,
      'backspace': 8,
      'break': 19,
      'caps': 20,
      'caps lock': 20,
      'cmd': 91,
      'command': 91,
      'control': 17,
      'ctl': 17,
      'ctrl': 17,
      'del': 46,
      'delete': 46,
      'down': 40,
      'end': 35,
      'enter': 13,
      'esc': 27,
      'escape': 27,
      'home': 36,
      'ins': 45,
      'insert': 45,
      'left': 37,
      'left command': 91,
      'my calculator': 183,
      'my computer': 182,
      'num lock': 144,
      'numpad *': 106,
      'numpad +': 107,
      'numpad -': 109,
      'numpad .': 110,
      'numpad /': 111,
      'option': 18,
      'page down': 34,
      'page up': 33,
      'pause': 19,
      'pause/break': 19,
      'pgdn': 34,
      'pgup': 33,
      'return': 13,
      'right': 39,
      'right command': 93,
      'scroll lock': 145,
      'shift': 16,
      'space': 32,
      'spc': 32,
      'tab': 9,
      'up': 38,
      'windows': 91,
      '⇧': 16,
      '⌃': 17,
      '⌘': 91,
      '⌥': 18
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

  find(pattern) {
    return pattern.map(key => {
      return this.keys[key]
    }).filter(key => {
      return key
    })
  }
}

class Pattern {
  constructor(pattern, keys) {
    this.pattern = pattern
    this.keys = keys
    this.active = 0
  }

  next(keyCode) {
    if (this.match(keyCode, this.keys[this.active])) {
      if (this.active < this.keys.length - 1) {
        this.active++

        return true
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

      return false
    }
  }
  match(key, current) {
    return key === current
  }

  reset() {
    this.active = 0
  }

  do(callback) {
    this.callback = callback
  }
}

export class Keyboard extends Keys {
  constructor() {
    super()

    this.shortcuts = []
    this.listen()
  }

  listen() {
    // Bind required for `this` context in window events
    this.keydown = this.keydown.bind(this)
    this.keyup = this.keyup.bind(this)

    if (window) {
      window.addEventListener('keydown', this.keydown)
      window.addEventListener('keyup', this.keyup)
    }
  }

  keydown(event) {
    if (event.keyCode) {
      if (this.findShortcut(event.keyCode)) {
        event.preventDefault()
      }
    }
  }

  keyup(event) {
    // Reset all patterns
    this.shortcuts.forEach(pattern => {
      pattern.reset()
    })

    event.preventDefault()
  }

  findShortcut(keyCode) {
    return this.shortcuts.find(shortcut => {
      return shortcut.next(keyCode)
    })
  }

  on(pattern) {
    let keys = this.find(pattern.toLowerCase().split('+'))
    let shortcut = new Pattern(pattern, keys)

    this.shortcuts.push(shortcut)

    return shortcut
  }

  off() {
    if (window) {
      window.removeEventListener('keydown', this.keydown)
      window.removeEventListener('keyup', this.keyup)
    }
  }
}
