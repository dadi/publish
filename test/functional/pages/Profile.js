'use strict'

const I = actor()

module.exports = {

  // insert your locators and methods here
  locators: {
    profileLink: (locate('a').withAttr({
      href: '/profile'
    }).as('Profile Link')),
    credentialsLink: (locate('a').withText('Credentials').as('Credentials Link')),
    personalDetailsLink: (locate('a').withText('Personal details').as('Personal Details Link')),
    idField: (locate('div').withAttr({
      'data-field-name': 'userName'
    }).find('input').as('Username Field')),
    currentPasswordField: (locate('div').withAttr({
      'data-field-name': 'password'
    }).find('input').before(locate('div').withText('Current password')).as('Current Password Field')),
    newPasswordField: (locate('.//div[2]/div[1]/div/label[2]/input').as('New Password Field')),
    confirmNewPasswordField: (locate('div').withAttr({
      'data-field-name': 'password'
    }).find('input').before(locate('div').withText('New password (confirm)')).as('Confirm New Password Field')),
    firstNameField: (locate('div').withAttr({
      'data-field-name': 'firstName'
    }).find('input').as('First Name Field')),
    lastNameField: (locate('div').withAttr({
      'data-field-name': 'lastName'
    }).find('input').as('Last Name Field')),
    saveSettings: (locate('button').withText('Save settings').as('Save Settings Button')),
    saveSetttingsDisabled: (locate('button[disabled]').withText('Save settings').as('Save Settings Button Disabled')),
    signOutButton: (locate('button').withText('Sign out').as('Sign Out Button')),
    confirmation: (locate('span').withText('Your profile')),
    articleLink: (locate('a').withAttr({
      href: '/articles'
    }).as('Article Link')),
    tryPassword: (locate('input').withAttr({
      type: 'password'
    }).at(1)),
    accountMenuOpen: (locate('span').withText('Open').as('Account Menu Open')),
    accountMenuClose: (locate('span').withText('Close').as('Account Menu Close'))
  },

  async changePersonalDetails(first, last) {
    await I.amOnPage('/profile')
    I.seeInCurrentUrl('/profile')
    I.see('Username')
    I.seeElement(this.locators.idField)
    I.see('Current password')
    I.seeElement(this.locators.currentPasswordField)
    I.see('New password')
    I.seeElement(this.locators.newPasswordField)
    I.see('New password (confirm)')
    I.seeElement(this.locators.confirmNewPasswordField)
    I.click(this.locators.personalDetailsLink)
    I.seeInCurrentUrl('/profile/personal-details')
    I.see('First name')
    // I.wait(2)
    await I.fillField(this.locators.firstNameField, first)
    I.see('Last name')
    await I.fillField(this.locators.lastNameField, '')
    await I.fillField(this.locators.lastNameField, last)
    I.click(this.locators.saveSettings)
    I.waitForText('Your profile has been updated')
    I.waitForFunction(() => document.readyState === 'complete')
    // I.wait(4)
    I.click(this.locators.accountMenuOpen)
    I.see(`${first} ${last}`)
    I.click(this.locators.accountMenuClose)
  },

  async invalidCurrentPassword(currentPassword, newPassword, confirmNewPassword) {
    await I.amOnPage('/profile/credentials')
    I.waitForFunction(() => document.readyState === 'complete')
    I.seeInCurrentUrl('/profile/credentials')
    await I.fillField(this.locators.currentPasswordField, currentPassword)
    await I.fillField(this.locators.newPasswordField, newPassword)
    await I.fillField(this.locators.confirmNewPasswordField, confirmNewPassword)
    I.click(this.locators.saveSettings)
    I.waitForFunction(() => document.readyState === 'complete')
    I.waitForText('This password is incorrect')
    I.dontSee('Your profile has been updated')
    I.seeElement(this.locators.saveSetttingsDisabled)
  },

  async newPasswordsNoMatch(currentPassword, newPassword, confirmNewPassword) {
    await I.amOnPage('/profile/credentials')
    I.waitForFunction(() => document.readyState === 'complete')
    I.seeInCurrentUrl('/profile/credentials')
    await I.fillField(this.locators.currentPasswordField, currentPassword)
    await I.fillField(this.locators.newPasswordField, newPassword)
    await I.fillField(this.locators.confirmNewPasswordField, confirmNewPassword)
    I.see('The passwords must match')
    I.seeElement(this.locators.saveSetttingsDisabled)
  },

  async successfulPasswordChange(currentPassword, newPassword, confirmNewPassword) {
    await I.amOnPage('/profile/credentials')
    I.waitForFunction(() => document.readyState === 'complete')
    I.seeInCurrentUrl('/profile/credentials')
    await I.fillField(this.locators.currentPasswordField, currentPassword)
    await I.fillField(this.locators.newPasswordField, newPassword)
    await I.fillField(this.locators.confirmNewPasswordField, confirmNewPassword)
    I.click(this.locators.saveSettings)
    I.waitForText('Your profile has been updated')
    // I.wait(4)
    I.click(this.locators.accountMenuOpen)
    I.retry(3).click(this.locators.signOutButton)
  },

  async gotoProfilePage() {
    I.click(this.locators.accountMenuOpen)
    I.click(this.locators.profileLink)
  }
}