Feature('Number Field Test Page - @smoke')

BeforeSuite(async (fieldPage, loginPage) => {
  await fieldPage.deleteAllNumbers()
  await loginPage.deleteUser('number')
  await loginPage.addUser('number', '123456', [
    'collection:cloud_field-test-number'
  ])
  await loginPage.createSession(
    'number',
    '123456',
    '/field-testing/field-test-number'
  )
})

AfterSuite(async (I, loginPage) => {
  await I.clearCookie('accessToken')
  await loginPage.deleteUser('number')
})

Scenario('Number Field Validation Tests', async fieldPage => {
  await fieldPage.validateNumber()
})
