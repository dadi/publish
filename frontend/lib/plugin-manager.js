import {Component, h} from 'preact'
import htm from 'htm'

export default class PluginManager {
  constructor () {
    this.__fieldHandlers = {}
  }

  addSafetyWrapper (Component) {
    const renderFn = Component.prototype.render

    Component.prototype.render = function () {
      try {
        return renderFn.apply(this, arguments)
      } catch (error) {
        console.error('Error in user component:', error)

        return null
      }
    }

    return Component
  }

  getFieldHandler (name) {
    const handler = this.__fieldHandlers[name.toLowerCase()]

    if (handler) {
      return this.addSafetyWrapper(handler)
    }
  }

  registerFieldHandler (name, handler) {
    this.__fieldHandlers[name.toLowerCase()] = handler(htm.bind(h), Component)
  }
}
