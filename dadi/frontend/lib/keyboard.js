'use strict'

class Keys {

  get keys () {
    return [
      {
        key: ' ',
        code: 'Space'
      },
      {
        key: 'a',
        code: 'KeyA'
      }
    ]
  }

  find (pattern) {
    return pattern.map(key => {
      return this.keys.find(local => {
        return local.key.toLowerCase() === key || local.code.toLowerCase() === key
      })
    }).filter(key => {
      return key
    })
  }
}

class Pattern {
  constructor (pattern, keys) {
    this.pattern = pattern
    this.keys = keys
    this.active = 0
  }

  next (key) {
    if (this.match(key, this.keys[this.active])) {
      if (this.active < this.keys.length -1) {
        this.active ++
      } else {
        this.callback({
          pattern: this.pattern,
          keys: this.keys
        })
        this.reset()
        return true
      }
    } else {
      this.reset()
      return false
    }
  }
  match (key, current) {
    return key.key === current.key && key.code === current.code
  }

  reset () {
    this.active = 0
  }

  do (callback) {
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
    if (window) {
      window.addEventListener('keydown', this.keydown.bind(this))
      window.addEventListener('keyup', this.keyup.bind(this))
    }
  }

  keydown (event) {
    if (event.key) {
      if (this.findShortcut({code: event.code, key: event.key})) {
        event.preventDefault() 
      }
    }
  }

  keyup (event) {
    this.shortcuts.forEach(pattern => {
      pattern.reset()
    })
    event.preventDefault()
  }

  findShortcut (key) {
    return this.shortcuts.filter(pattern => {
      return pattern.next(key)
    })
  }

  on (pattern) {
    let keys = this.find(pattern.split('+'))
    let shortcut = new Pattern(pattern, keys)
    this.shortcuts.push(shortcut)
    return shortcut
  }
}
