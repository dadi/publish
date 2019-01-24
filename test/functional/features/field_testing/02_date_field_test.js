Feature('Date Field Test Page - @smoke')

BeforeSuite(async (fieldPage, loginPage) => {
  await fieldPage.deleteAllDates()
  await loginPage.deleteUser('date')
  await loginPage.addUser('date', '123456', ['collection:cloud_field-test-date'])
  await loginPage.createSession('date', '123456', '/field-testing/field-test-date')
})

AfterSuite(async (I, loginPage) => {
  await I.clearCookie('accessToken')
  await loginPage.deleteUser('date')
})

Scenario('Date Field Validation Tests', async (fieldPage) => {
  await fieldPage.validateDate()
})
