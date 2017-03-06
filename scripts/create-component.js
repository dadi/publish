'use strict'

const inquirer = require('inquirer')
const fs = require('fs')
const path = require('path')
const ui = new inquirer.ui.BottomBar()

// Fetch reducers
let files = fs.readdirSync(path.resolve(path.join(__dirname,'../dadi/frontend/reducers'))).map(file => {
  return path.parse(file)
}).filter(file => {
  return file.name !== 'index'
})

let components = fs.readdirSync(path.resolve(path.join(__dirname,'../dadi/frontend/components'))).map(file => {
  return path.parse(file)
})

let views = fs.readdirSync(path.resolve(path.join(__dirname,'../dadi/frontend/views'))).map(file => {
  return path.parse(file)
})

let containers = fs.readdirSync(path.resolve(path.join(__dirname,'../dadi/frontend/containers'))).map(file => {
  return path.parse(file)
})

const toCamelCase = (str) => {
  return str
    .replace(/\s(.)/g, $1 => { return $1.toUpperCase() })
    .replace(/\s/g, '')
    .replace(/^(.)/, $1 => { return $1.toUpperCase() })
}

const CreateComponent = function() {

  this.results = {}

  let questions = {
    type: { 
      type: 'list', 
      name: 'type',
      message: 'What type of template would you like to create?',
      choices: ['Component','Container','View'],
      filter: str => {
        return str.toLowerCase()
      },
      callback: (answer) => {
        questions.name.message = `What is your ${answer.type}'s name?`
        Object.assign(this.results, answer)
        if (answer.type !== 'component') {
          this.query(questions.actions)
        } else {
          this.query(questions.name)
        }
      }
    },
    actions: { 
      type: 'checkbox', 
      name: 'actions',
      message: 'Which actions would you like to bind?',
      choices: Object.assign([], files.map(file => { return file.name })),
      callback: (answer) => {
        Object.assign(this.results, answer)
        this.query(questions.name)
      }
    },
    name: { 
      type: 'input', 
      name: 'name',
      validate: this.validateName.bind(this),
      filter: str => {
        return toCamelCase(str)
      },
      callback: (answer) => {
        Object.assign(this.results, answer)
        this.query(questions.save)
      }
    },
    save: { 
      type: 'confirm', 
      name: 'save',
      message: 'Save file?',
      callback: (answer) => {
        if (answer.save) {
          this.saveToFile()
        }
      }
    }
  }

  this.query(questions.type)
}

CreateComponent.prototype.validateName = function (str) {
  let match

  switch(this.results.type) {
    case 'component':
      match = components.find(component => {
        return str === component.name
      })
    break
    case 'container':
      match = containers.find(container => {
        return str === container.name
      })
    break
    case 'view':
      match = views.find(view => {
        return str === view.name
      })
    break
  }
  if (match) {
    ui.log.write(`${this.results.type} ${str} already exists!`)
    return
  }

  return str.length > 0
}

CreateComponent.prototype.query = function(question) {
  this.Enquirer = inquirer
  this.Enquirer.prompt(question).then(question.callback)
}

CreateComponent.prototype.saveToFile = function() {
  let fileContent = ''
  switch(this.results.type) {
    case 'component':
      fileContent = this.component()
    break
    case 'container':
      fileContent = this.container()
    break
    case 'view':
      fileContent = this.view()
    break
  }
  fs.writeFile(path.resolve(__dirname, `../dadi/frontend/${this.results.type}s/${this.results.name}.jsx`), fileContent, (err) => {
    if (err) throw err
<<<<<<< HEAD
    console.log('It\'s saved!')
=======
    ui.log.write('Saved!')
>>>>>>> 7cca401da8fe81e6f102ae549f9d70c19fd4d6fb
  })
}

CreateComponent.prototype.component = function () {
  return `'use strict'

import {h, Component} from 'preact'

import Style from 'lib/Style'
import styles from './${this.results.name}.css'

export default class ${this.results.name} extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <p>${this.results.name}</p>
    )
  }
}
`
}

CreateComponent.prototype.view = function () {
  let actions = this.createActions()
  let imports = this.createImports()
  let state = this.createState()

  return `use strict'

import {h, Component} from 'preact'
import {connect} from 'preact-redux'
import {bindActionCreators} from 'redux'
import {connectHelper} from 'lib/util'${imports}

class ${this.results.name} extends Component {
  render() {
    const { type } = this.props

    return (
      <p>${this.results.name}</p>
    )
  }
}

export default connectHelper(
  state => ${state},
  dispatch => bindActionCreators(${actions}, dispatch)
)(${this.results.name})
`
}

CreateComponent.prototype.createActions = function () {
  let actions = '{}'

  if (this.results.actions.length === 1) {
    actions = `${this.results.actions[0]}Actions`
  } else if (this.results.actions.length > 1) {
    actions = `{${this.results.actions.map( action => { return `...${action}Actions` } ).join(',')}}`
  }

    return actions
}

CreateComponent.prototype.createImports = function () {
  let imports = ''

  if (this.results.actions.length === 1) {
    imports = `

import * as ${this.results.actions[0]}Actions from 'actions/${this.results.actions[0]}Actions'`
  } else if (this.results.actions.length > 1) {
    imports = `
  ${this.results.actions.map( action => { return `
import * as ${action}Actions from 'actions/${action}Actions'` } ).join('')}`
  }

  return imports
}

CreateComponent.prototype.createState = function () {
  if (this.results.actions.length < 1 || this.results.actions.length > 1) return 'state'
  return `state.${this.results.actions[0]}`
}

CreateComponent.prototype.container = function () {
  let actions = this.createActions()
  let imports = this.createImports()
  let state = this.createState()

  return `use strict'

import {h, Component} from 'preact'
import {connect} from 'preact-redux'
import {bindActionCreators} from 'redux'
import {connectHelper} from 'lib/util'${imports}

class ${this.results.name} extends Component {
  render() {
    const { type } = this.props

    return (
      <p>${this.results.name}</p>
    )
  }
}

export default connectHelper(
  state => ${state},
  dispatch => bindActionCreators(${actions}, dispatch)
)(${this.results.name})

`
}

module.exports = function() {
  return new CreateComponent()
}

module.exports.CreateComponent = new CreateComponent()