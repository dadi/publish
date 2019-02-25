'use strict'

const I = actor()

const {
  assert,
  expect
} = require('chai')

module.exports = {

  // insert your locators and methods here
  locators: {
    usernameField: (locate('input').withAttr({
      placeholder: 'Your username'
    }).as('Username Field')),
    passwordField: (locate('input').withAttr({
      placeholder: 'Your password'
    }).as('Password Field')),
    signInButtonDisabled: (locate('button[type=submit][disabled]').as('Sign In Button Disabled')),
    signInButton: (locate('button[type = submit]').withText('Sign In').as('Sign In Button')),
    publishMenu: (locate('a').withAttr({
      href: '/'
    }).as('Publish Menu')),
    navigationMenu: (locate('.//nav').as('Navigation Menu')),
    articleLink: (locate('a').withAttr({
      href: '/articles'
    })),
    signOutButton: (locate('button').withText('Sign out').as('Sign Out Button')),
    accountMenuOpen: (locate('span').withText('Open').as('Account Menu Open'))
  },

  async validateSignInPage() {
    I.amOnPage('/')
    I.waitForFunction(() => document.readyState === 'complete')
    I.seeInCurrentUrl('/sign-in')
    I.seeElement(this.locators.usernameField)
    I.seeElement(this.locators.passwordField)
    I.seeElement(this.locators.signInButton)
  },

  async validateUnauthPageLoad() {
    I.amOnPage('/articles')
    I.waitForFunction(() => document.readyState === 'complete')
    I.seeInCurrentUrl('/sign-in')
  },

  validateInvalidCredentials(username, password) {
    I.fillField(this.locators.usernameField, username)
    I.seeElement(this.locators.signInButtonDisabled)
    I.fillField(this.locators.passwordField, password)
    I.click(this.locators.signInButton)
    I.waitForFunction(() => document.readyState === 'complete')
    I.waitForText('Username not found or password incorrect')
  },

  async validateSignIn(username, password) {
    I.waitForVisible(this.locators.usernameField)
    I.fillField(this.locators.usernameField, username)
    I.seeElement(this.locators.signInButtonDisabled)
    I.fillField(this.locators.passwordField, password)
    I.click(this.locators.signInButton)
    I.waitForFunction(() => document.readyState === 'complete')
    I.resizeWindow(1200, 650)
    I.waitForText('Welcome,')
    I.waitForVisible(this.locators.navigationMenu, 4)
    I.see('Articles')
  },

  async validateSignOut() {
    I.click(this.locators.accountMenuOpen)
    I.retry(3).click(this.locators.signOutButton)
    I.waitForText('Password')
    I.seeInCurrentUrl('/sign-in')
    I.seeElement(this.locators.usernameField)
    I.seeElement(this.locators.passwordField)
    I.seeElement(this.locators.signInButton)
  },

  async addUser(id, secret, selectedResources) {
    await I.createClient(id, secret, selectedResources)
  },

  async createSession(id, secret, url) {
    let data = await I.getSessionToken(id, secret)
    let x = JSON.parse(data)
    let token = x.accessToken
    let value = Date.now() + 1800 * 1000
    await I.amOnPage(url)
    await I.setCookie({
      name: 'accessToken',
      value: token
    })
    await I.setCookie({
      name: 'accessTokenExpiry',
      value: value.toString()
    })
    await I.resizeWindow(1200, 650)
  },

  async deleteUser(id) {
    await I.deleteClient(id)
  },

  async gotoHomePage() {
    await I.click(this.locators.accountMenuOpen)
  }
}