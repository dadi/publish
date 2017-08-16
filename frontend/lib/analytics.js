'use strict'

/**
 * @class  Analytics
 */
export default class Analytics {
  /**
   * @contructor
   * @param  {Object} rules [description]
   * @param  {Object|String|Array} value Value to be validated
   */
  constructor () {
    this.injectScript()

    return this
  }

  injectScript () {
    (function (i, s, o, g, r, a, m) {
      i['GoogleAnalyticsObject'] = r
      i[r] = i[r] || function () {
        (i[r].q = i[r].q || []).push(arguments)
      }, i[r].l = 1 * new Date()
      a = s.createElement(o),
        m = s.getElementsByTagName(o)[0]
      a.async = 1
      a.src = g
      m.parentNode.insertBefore(a, m)
    })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga')
  }

  register (trackingId) {
    this.trackingId = trackingId

    if (!typeof ga === 'function') {
      console.log('ga not initialised')

      return this
    }
    if (!trackingId) {
      console.log('Tracking ID not defined')

      return this
    }

    ga('create', this.trackingId, 'auto')
    ga((tracker) => this.getClientId(tracker))

    return this
  }

  getClientId (tracker) {
    this.clientId = tracker.get('clientId')
  }

  pageview (path) {
    if (this.trackingId) {
      ga('send', 'pageview', path)
    }

    return this
  }

  isActive () {
    return (this.trackingId && this.clientId)
  }

  get clientId () {
    return this._clientId
  }

  set clientId (clientId) {
    this._clientId = clientId
  }

  get trackingId () {
    return this._trackingId
  }

  set trackingId (trackingId) {
    this._trackingId = trackingId
  }
}