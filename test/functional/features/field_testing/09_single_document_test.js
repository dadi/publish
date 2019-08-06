Feature('Single Document Test Page - @smoke')

BeforeSuite(async (fieldPage, loginPage) => {
  await loginPage.deleteUser('single')
  await loginPage.addUser('single', '123456', [
    'collection:cloud_team',
    'collection:cloud_test-single-document'
  ])
  await loginPage.createSession('single', '123456', '/test-single-document')
})

AfterSuite(async (I, loginPage) => {
  await I.clearCookie('accessToken')
  await loginPage.deleteUser('single')
})

Scenario('Single Document Validation Tests', async fieldPage => {
  await fieldPage.validateSingleDocument()
})
