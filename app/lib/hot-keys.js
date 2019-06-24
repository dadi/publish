import isHotkey from 'is-hotkey'

class HotKeys {
  constructor(handlers) {
    this.eventHandler = this._capture.bind(this, false)
    this.handlers = {}

    Object.keys(handlers || {}).forEach(key => {
      this.on(key, handlers[key])
    })
  }

  _capture(allowDefaultHandlers, event) {
    // eslint-disable-next-line array-callback-return
    Object.keys(this.handlers).some(key => {
      if (this.handlers[key].hotKey(event)) {
        if (!allowDefaultHandlers) {
          event.preventDefault()
        }

        this.handlers[key].callback(event)

        return true
      }
    })
  }

  addListener() {
    window.addEventListener('keydown', this.eventHandler)
  }

  capture(allowDefaultHandlers) {
    return this._capture.bind(this, allowDefaultHandlers)
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
