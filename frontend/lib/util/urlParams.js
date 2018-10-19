class URLParams {
  constructor (input) {
    this.input = input
  }

  toObject () {
    if (!this.input || typeof this.input !== 'string') {
      return
    }

    let params = this.input.replace(/^(\?)/, '')
      .replace(/"/g, '\\"')
      .replace(/&/g, '","')
      .replace(/=/g, '":"')

    params = JSON.parse('{"' + decodeURI(params) + '"}')

    Object.keys(params).forEach(key => {
      try {
        // Try to parse valid JSON parameters
        params[key] = JSON.parse(params[key])
      } catch (err) {
        return
      }
    })

    return params
  }

  toString () {
    if (!this.input || typeof this.input !== 'object') {
      return
    }

    let params = Object.keys(this.input)
      .filter(key => this.input[key])
      .map(key => {
        if (typeof this.input[key] === 'object') {
          try {
            return `${key}=${JSON.stringify(this.input[key])}`
          } catch (err) {
            return `${key}=${this.input[key]}`
          }
        } else {
          return `${key}=${this.input[key]}`
        }
      })

    return params.join('&')
  }
}

exports.URLParams = URLParams
