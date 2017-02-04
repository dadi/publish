'use strict'

const config = require(GLOBAL.paths.config)
const fs = require('fs')
const path = require('path')
const _ = require('underscore')
const _s = require('underscore.string')
const mkdirp = require('mkdirp')

const db_path = path.resolve(config.get('paths.db'))

class Field {
  constructor (data) {
    _.each(data, (val, key) => {
      this[key] = val
    })
  }
  getPath () {
    return `${this.constructor.name.toLowerCase()}s`
  }
}

var classes = {
  String: class extends Field {},
  Object: class extends Field {},
  Array: class extends Field {},
  Number: class extends Field {},
  Date: class extends Field {},
  Pattern: class extends Field {},
  Boolean: class extends Field {}
}

const Schemas = function () {
  // Get all collection files
  let collections = fs.readdirSync(path.join(__dirname, 'collections'))
  // Iterate collections appending classes
  this.iterateCollections(collections)
  this.createDirectories()
}

Schemas.prototype.iterateCollections = function (collections) {

  Object.assign(classes, ..._.map(collections, (collection) => {
    let schema = this.getCollection(collection)
    return {
      [schema.classname]: class {
        constructor (data) {
          if (!_.isUndefined(data)) {
            _.each(schema.fields, (field, key) => {
              if (data[key] && classes[field.type]) {
                this[key] = new classes[field.type]({[key]: data[key]}) 
                console.log("SET", this[key])
              }
            })
          }
        }
        getPath () {
          return `${this.constructor.name.toLowerCase()}s`
        }
      }
    }
  }))
}

Schemas.prototype.createDirectories = function () {
  _.each(classes, (className, key) => {
    console.log("CREATE", key)
    mkdirp.sync(path.join(db_path, key))
  })
}

Schemas.prototype.getCollection = function (collection) {
  let content = fs.readFileSync(path.join(__dirname, 'collections', collection),'utf8')
  let body = JSON.parse(content)
  return {
    classname: _s.capitalize(path.parse(collection).name),
    fields: body.fields
  }
}

Schemas.prototype.getSchema = function (name) {
  return _.find(classes, (className) => {
    return new className().getPath() === name
  })
}

module.exports = function () {
  return new Schemas()
}

module.exports.Schemas = Schemas