'use strict'

const I = actor()

module.exports = {
  // insert your locators and methods here
  locators: {
    profileLink: locate('a')
      .withAttr({
        href: '/profile'
      })
      .as('Profile Link'),
    credentialsLink: locate('a')
      .withText('Credentials')
      .as('Credentials Link'),
    personalDetailsLink: locate('a')
      .withText('Personal details')
      .as('Personal Details Link'),
    idField: locate('div')
      .withAttr({
        'data-field-name': 'userName'
      })
      .find('input')
      .as('Username Field'),
    currentPasswordField: locate('input[name*="currentSecret"]').as(
      'Current Password Field'
    ),
    newPasswordField: locate('input[name*="secret"]').as('New Password Field'),
    confirmNewPasswordField: locate('input[name*="secret-confirm"]').as(
      'Confirm New Password Field'
    ),
    firstNameField: locate('input[name*="data.publishFirstName"]').as(
      'First Name Field'
    ),
    lastNameField: locate('input[name*="data.publishLastName"]').as(
      'Last Name Field'
    ),
    saveSettings: locate('button')
      .withText('Save settings')
      .as('Save Settings Button'),
    saveSetttingsDisabled: locate('button[disabled]')
      .withText('Save settings')
      .as('Save Settings Button Disabled'),
    signOutButton: locate('a')
      .withText('Sign out')
      .as('Sign Out Button'),
    confirmation: locate('span').withText('Your profile'),
    articleLink: locate('a')
      .withAttr({
        href: '/articles'
      })
      .as('Article Link'),
    tryPassword: locate('input')
      .withAttr({
        type: 'password'
      })
      .at(1),
    accountMenuOpen: locate('button[class*="Header__user-menu-toggle"]').as(
      'Account Menu Open'
    ),
    accountMenuClose: locate('span')
      .withText('Close')
      .as('Account Menu Close'),
    personalDetailsTab: locate('a[class*="SubNavItem"]')
      .withText('Personal details')
      .as('Personal Details Tab'),
    credentialsTab: locate('a[class*="SubNavItem"]')
      .withText('Credentials')
      .as('Credentials Tab')
  },

  async changePersonalDetails(first, last) {
    await I.amOnPage('/profile/personal-details')
    I.seeInCurrentUrl('/profile/personal-details')
    I.seeElement(this.locators.firstNameField)
    I.seeElement(this.locators.lastNameField)
    I.see('First name')
    await I.fillField(this.locators.firstNameField, first)
    I.see('Last name')
    await I.fillField(this.locators.lastNameField, '')
    await I.fillField(this.locators.lastNameField, last)
    I.click(this.locators.saveSettings)
    I.waitForText('Your settings have been updated')
    I.waitForFunction(() => document.readyState === 'complete')
  },

  async invalidCurrentPassword(
    currentPassword,
    newPassword,
    confirmNewPassword
  ) {
    await I.amOnPage('/profile/credentials')
    I.waitForFunction(() => document.readyState === 'complete')
    I.seeInCurrentUrl('/profile/credentials')
    await I.fillField(this.locators.currentPasswordField, currentPassword)
    await I.fillField(this.locators.newPasswordField, newPassword)
    await I.fillField(this.locators.confirmNewPasswordField, confirmNewPassword)
    I.click(this.locators.saveSettings)
    I.waitForFunction(() => document.readyState === 'complete')
    I.waitForText('The current password is incorrect')
    I.waitForText('Could not update your settings')
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

  async successfulPasswordChange(
    currentPassword,
    newPassword,
    confirmNewPassword
  ) {
    await I.amOnPage('/profile/credentials')
    I.waitForFunction(() => document.readyState === 'complete')
    I.seeInCurrentUrl('/profile/credentials')
    await I.fillField(this.locators.currentPasswordField, currentPassword)
    await I.fillField(this.locators.newPasswordField, newPassword)
    await I.fillField(this.locators.confirmNewPasswordField, confirmNewPassword)
    I.click(this.locators.saveSettings)
    I.waitForText('Your settings have been updated')
    I.click(this.locators.accountMenuOpen)
    I.retry(3).click(this.locators.signOutButton)
  },

  async gotoProfilePage() {
    I.click(this.locators.accountMenuOpen)
    I.click(this.locators.profileLink)
  }
}
