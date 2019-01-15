Feature('Profile Page Password Change - @smoke')

BeforeSuite(async (loginPage, profilePage) => {
  await loginPage.deleteUser('syst_four')
  await loginPage.addUser('syst_four', '123456')
  await loginPage.createSession('syst_four', '123456', '/profile/credentials')
})

AfterSuite(async (I, loginPage) => {
  await I.clearCookie('accessToken')
  await loginPage.deleteUser('syst_four')
})

Before(async (loginPage, profilePage) => {
})

After((loginPage) => {
})

// DataTable to test different combinations of password fields
let passwords = new DataTable(['currentPassword', 'newPassword', 'confirmNewPassword'])
passwords.add(['123456', '123456', '123455'])
passwords.add(['123456', '123457', '123456'])

Data(passwords).Scenario('Invalid Passwords - Screen Error', async (current, loginPage, profilePage) => {
  await profilePage.newPasswordsNoMatch(current.currentPassword, current.newPassword, current.confirmNewPassword)
})

Scenario('Invalid Current Password - Screen Error', async (loginPage, profilePage) => {
  await profilePage.invalidCurrentPassword('12345', '1234567', '1234567')
})

Scenario('Successful Password Change', async (loginPage, profilePage) => {
  await profilePage.successfulPasswordChange('123456', '654321', '654321')
  await loginPage.validateSignIn('syst_four', '654321')
})