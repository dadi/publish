'use strict'

export class DocumentRoutes {
  constructor (props) {
    const {state} = props

    this.props = props
    this.paths = state.api.paths
    this.pathname = state.router.locationBeforeTransitions.pathname
    this.parts = this.pathname
    this.routes = this.siblingRoutes()

    return this
  }

  siblingRoutes () {
    return Object.keys(this.paths)
      .map(key => {
        return this.paths[key]
          .map((path, pos) => this.filterRoutes(path, pos))
          .find(Boolean)
      }).find(Boolean)
  }

  filterRoutes (path, pos) {
    const match = path
      .split('/')
      .map((part, index) => {
        const {
          isVar,
          isOptional,
          varName
        } = this.analysePart(part)

        return (!isVar && (part === this.parts[index])) ||
          (isVar && this.props[varName] === this.parts[index]) ||
          isOptional
      })
      .every(Boolean)

    return match ? {
      create: this.paths.create[pos],
      edit: this.paths.edit[pos],
      list: this.paths.list[pos]
    } : match
  }

  renderCreateRoute (values) {
    return this.renderRoute(this.routes.create, values)
  }

  renderEditRoute (values) {
    return this.renderRoute(this.routes.edit, values)
  }

  renderRoute (route, values) {
    const pieces = route
      .split('/')

    return '/' + pieces
      .map(piece => {
        const {
          isVar,
          isOptional,
          varName
        } = this.analysePart(piece)

        if (isOptional && !values[varName]) return
        if (isVar) return values[varName]

        return piece
      })
      .filter(Boolean)
      .join('/')
  }

  analysePart (part) {
    return {
      isOptional: part.endsWith('?'),
      isVar: part.startsWith(':'),
      varName: part
        .replace(':', '')
        .replace('?', '')
    }
  }

  get parts () {
    return this._parts
  }

  set parts (pathname) {
    this._parts = pathname
      .replace(/^\/|\/$/g, '')
      .split('/')
  }
}
