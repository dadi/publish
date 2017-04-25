'use strict'

const path = require('path')
const global = require(path.resolve(path.join(__dirname, '../../app/globals'))) // eslint-disable-line
const config = require(paths.config)
const Api = require(`${paths.lib.models}/api`)

const inquirer = require('inquirer')
const ui = new inquirer.ui.BottomBar()

const CreateUser = function () {
  this.results = {}

  let questions = {
    first_name: {
      type: 'input',
      name: 'first_name',
      message: 'What is your first name?',
      callback: (answer) => {
        Object.assign(this.results, answer)
        this.query(questions.last_name)
      }
    },
    last_name: {
      type: 'input',
      name: 'last_name',
      message: 'What is your last name?',
      callback: (answer) => {
        Object.assign(this.results, answer)
        this.query(questions.email)
      }
    },
    email: {
      type: 'input',
      name: 'email',
      message: 'What is your email address?',
      validate: this.validateEmail.bind(this),
      callback: (answer) => {
        Object.assign(this.results, answer)
        this.query(questions.password)
      }
    },
    password: {
      type: 'password',
      name: 'password',
      message: 'Choose a password',
      callback: (answer) => {
        Object.assign(this.results, answer)
        this.query(questions.password_match)
      }
    },
    password_match: {
      type: 'password',
      name: 'password_match',
      message: 'Type password to confirm',
      validate: this.passwordMatch.bind(this),
      callback: (answer) => {
        Object.assign(this.results, answer)
        this.query(questions.save)
      }
    },
    save: {
      type: 'confirm',
      name: 'save',
      message: 'Create user?',
      callback: (answer) => {
        if (answer.save) {
          this.insertNewUser()
        }
      }
    }
  }
  this.query(questions.first_name)
}

CreateUser.prototype.passwordMatch = function (str) {
  let match = this.results.password === str
  if (!match) {
    ui.log.write('Password does not match!')
    return
  }

  return true
}

CreateUser.prototype.validateEmail = function (str) {
  let authAPI = config.get('auth')

  if (!authAPI.enabled) return

  return new Api(authAPI)
    .in(authAPI.collection)
    .whereFieldIsEqualTo('email', str)
    .find({extractResults: true}).then(user => {
      if (user.length > 0) {
        ui.log.write(`${str} is already in use!`)
        return
      }
      let isValidEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(str)
      if (!isValidEmail) {
        ui.log.write(`${str} is not a valid email address!`)
        return
      }
      return true
    }).catch(err => {
      return err
    })
}

CreateUser.prototype.query = function (question) {
  this.Enquirer = inquirer
  this.Enquirer.prompt(question).then(question.callback)
}

CreateUser.prototype.insertNewUser = function () {
  let authAPI = config.get('auth')

  if (!authAPI.enabled) return false

  Reflect.deleteProperty(this.results, 'password_match')

  return new Api(authAPI)
    .in(authAPI.collection)
    .create(this.results)
    .then(user => {
      if (user) {
        ui.log.write(`Created ${JSON.stringify(user, null, 2)}`)
      } else {
        ui.log.write(`Failed to created. ${JSON.stringify(this.results, null, 2)}`)
      }
    }).catch(err => {
      ui.log.write(`err. ${JSON.stringify(err, null, 2)}`)
      return false
    })
}

module.exports = function () {
  return new CreateUser()
}

module.exports.CreateUser = new CreateUser()
