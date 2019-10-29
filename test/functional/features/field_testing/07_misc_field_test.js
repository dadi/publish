Feature('Misc Field Test Page - @smoke')

BeforeSuite(async (mediaPage, fieldPage, loginPage) => {
  await loginPage.deleteUser('misc-field')
  await loginPage.addUser('misc-field', '123456', [
    'media:mediaStore',
    'collection:cloud_field-test-other'
  ])
  await loginPage.createSession(
    'misc-field',
    '123456',
    '/field-testing/field-test-other'
  )
})

AfterSuite(async (I, loginPage, mediaPage) => {
  await I.clearCookie('accessToken')
  await loginPage.deleteUser('misc-field')
})

Scenario('Misc Field Validation Tests', async fieldPage => {
  await fieldPage.validateMiscField()
})
