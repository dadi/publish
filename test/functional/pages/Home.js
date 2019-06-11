'use strict'

const I = actor()

const {assert, expect} = require('chai')

module.exports = {
  // insert your locators and methods here
  locators: {
    publishMenu: locate('a')
      .withAttr({
        href: '/'
      })
      .as('Publish Menu'),
    navigationMenu: locate('.//nav').as('Navigation Menu'),
    articleLink: locate('a')
      .withAttr({
        href: '/articles'
      })
      .as('Article Link'),
    signOutButton: locate('button')
      .withText('Sign out')
      .as('Sign Out Button')
  },

  async goToArticles() {
    I.click(this.locators.articleLink)
    I.waitForFunction(() => document.readyState === 'complete')
    await I.seeInCurrentUrl('/articles')
  }
}
