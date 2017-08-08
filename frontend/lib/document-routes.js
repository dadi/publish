'use strict'

export class DocumentRoutes {
  constructor (props) {
    this.matches = props.matches
    this.paths = props.paths
    this.path = props.path
    this.routes = this.siblingRoutes()

    return this
  }

  siblingRoutes () {
    return Object.keys(this.paths)
      .map(key => this.paths[key]
        .map((path, pos) => this.filterRoutes(path, pos))
        .find(Boolean)
      ).find(Boolean)
  }

  filterRoutes (path, pos) {
    return this.path === path ? {
      create: this.paths.create[pos],
      edit: this.paths.edit[pos],
      list: this.paths.list[pos]
    } : false
  }

  createRoute (values) {
    return this.renderRoute(this.routes.create, Object.assign({}, this.matches, values))
  }

  editRoute (values) {
    return this.renderRoute(this.routes.edit, Object.assign({}, this.matches, values))
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
        .replace(/\[.*\]/g, '')
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
