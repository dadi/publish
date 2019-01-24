Feature('String Field Test Page - @smoke')

BeforeSuite(async (fieldPage, loginPage) => {
  // await fieldPage.deleteAllNumbers()
  await loginPage.deleteUser('string')
  await loginPage.addUser('string', '123456', ['collection:cloud_field-test-string'])
  await loginPage.createSession('string', '123456', '/field-testing/field-test-string')
})

AfterSuite(async (I, loginPage) => {
  await I.clearCookie('accessToken')
  await loginPage.deleteUser('string')
})

Scenario('String Field Validation Tests', async (fieldPage) => {
  await fieldPage.validateString()
})
