'use strict'

export function urlHelper () {
  return {
    paramsToObject (source) {
      if (!source || source === undefined) return null
      let params = JSON.parse('{"' + decodeURI(source.replace(/^(\?)/, ''))
        .replace(/"/g, '\\"')
        .replace(/&/g, '","')
        .replace(/=/g, '":"') + '"}')

      Object.keys(params).forEach(param => {
        try {
          params[param] = JSON.parse(params[param])
        } catch (e) {
          return
        }
      })

      return params
    },
    paramsToString (params) {
      return Object.keys(params)
        .filter(key => params[key])
        .map(key => {
          if (typeof params[key] === 'object') {
            try {
              return key + '=' + JSON.stringify(params[key])
            } catch (e) {
              return key + '=' + params[key]
            }
          } else {
            return key + '=' + params[key]
          }
        })
        .join('&')
    }
  }
}