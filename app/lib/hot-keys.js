import isHotkey from 'is-hotkey'

class HotKeys {
  constructor(handlers) {
    this.eventHandler = this._capture.bind(this)
    this.handlers = {}

    Object.keys(handlers || {}).forEach(key => {
      this.on(key, handlers[key])
    })
  }

  _capture(event) {
    Object.keys(this.handlers).some(key => {
      if (this.handlers[key].hotKey(event)) {
        event.preventDefault()

        this.handlers[key].callback(event)

        return true
      }
    })
  }

  addListener() {
    window.addEventListener('keydown', this.eventHandler)
  }

  capture() {
    return this._capture.bind(this)
  }

  on(key, callback) {
    this.handlers[key] = {
      callback,
      hotKey: isHotkey(key)
    }
  }

  removeListener() {
    window.removeEventListener('keydown', this.eventHandler)
  }
}

export default HotKeys
