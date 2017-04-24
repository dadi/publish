'use strict'

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
        this.query(questions.username)
      }
    },
    username: {
      type: 'input',
      name: 'username',
      message: 'Choose a unique username',
      validate: this.checkForDuplicate.bind(this),
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

CreateUser.prototype.checkForDuplicate = function (str) {
  let match

  if (match) {
    ui.log.write(`${str} already in use!`)
    return
  }

  return true
}

CreateUser.prototype.validateEmail = function (str) {
  let match

  // let isDuplicate = this.checkForDuplicate(str)
  // if (isDuplicate) {
  //   return
  // }

  // Check address
  if (match) {
    ui.log.write(`${str} is not a valid email address!`)
    return
  }

  return true
}

CreateUser.prototype.query = function (question) {
  this.Enquirer = inquirer
  this.Enquirer.prompt(question).then(question.callback)
}

CreateUser.prototype.insertNewUser = function () {
  console.log(this.results)
  ui.log.write('Saved!')

  // let fileContent = ''
  // switch (this.results.type) {
  //   case 'component':
  //     fileContent = this.component()
  //     break
  //   case 'container':
  //     fileContent = this.container()
  //     break
  //   case 'view':
  //     fileContent = this.view()
  //     break
  // }
  // let writePath = path.resolve(__dirname, `../../frontend/${this.results.type}s/${this.results.name}`)
  // mkdirp(writePath, err => {
  //   if (err) {
  //     return console.log('ERROR! Couldn\'t create output path.')
  //   }

  //   fs.writeFile(path.join(writePath, `${this.results.name}.jsx`), fileContent, (err) => {
  //     if (err) throw err
  //     ui.log.write('Saved!')
  //   })
  // })
}

module.exports = function () {
  return new CreateUser()
}

module.exports.CreateUser = new CreateUser()
