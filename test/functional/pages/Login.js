'use strict'

const I = actor()

module.exports = {
  // insert your locators and methods here
  locators: {
    usernameField: locate('input')
      .withAttr({
        placeholder: 'Your username'
      })
      .as('Username Field'),
    passwordField: locate('input')
      .withAttr({
        placeholder: 'Your password'
      })
      .as('Password Field'),
    signInButtonDisabled: locate('button[type=submit][disabled]').as(
      'Sign In Button Disabled'
    ),
    signInButton: locate('button[type = submit]')
      .withText('Sign In')
      .as('Sign In Button'),
    articleLink: locate('a').withAttr({
      href: '/articles'
    }),
    signOutButton: locate('a')
      .withText('Sign out')
      .as('Sign Out Button'),
    accountMenuOpen: locate('button[class*="Header__user-menu-toggle"]').as(
      'Account Menu Open'
    )
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
    I.waitForText('Welcome')
    I.see('ARTICLES')
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
    const data = await I.getSessionToken(id, secret)
    const x = JSON.parse(data)
    const token = x.accessToken
    const value = Date.now() + 1800 * 1000

    I.amOnPage(url)
    I.setCookie({
      name: 'accessToken',
      value: token
    })
    I.setCookie({
      name: 'accessTokenExpiry',
      value: value.toString()
    })
    I.resizeWindow(1200, 650)
  },

  async deleteUser(id) {
    await I.deleteClient(id)
  },

  async gotoHomePage() {
    await I.click(this.locators.accountMenuOpen)
  }
}
