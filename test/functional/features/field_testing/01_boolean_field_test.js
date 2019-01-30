Feature('Boolean Field Test Page - @smoke')

BeforeSuite(async (fieldPage, loginPage) => {
  await fieldPage.deleteAllBooleans()
  await loginPage.deleteUser('boolean')
  await loginPage.addUser('boolean', '123456', ['collection:cloud_field-test-boolean'])
  await loginPage.createSession('boolean', '123456', '/field-testing/field-test-boolean')
})

AfterSuite(async (I, loginPage) => {
  await I.clearCookie('accessToken')
  await loginPage.deleteUser('boolean')
})

Scenario('Boolean Field Validation Tests', async (fieldPage) => {
  await fieldPage.validateBoolean()
})
