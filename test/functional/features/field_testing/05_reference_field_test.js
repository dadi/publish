Feature('Reference Field Test Page - @smoke')

BeforeSuite(async (articlePage, fieldPage, loginPage) => {
  await articlePage.insertAuthor('Joe Bloggs', 'Author')
  await loginPage.deleteUser('reference')
  await loginPage.addUser('reference', '123456', ['collection:cloud_team', 'collection:cloud_field-test-reference'])
  await loginPage.createSession('reference', '123456', '/field-testing/field-test-reference')
})

AfterSuite(async (I, loginPage) => {
  await I.clearCookie('accessToken')
  await loginPage.deleteUser('reference')
})

Scenario('Reference Field Validation Tests', async (fieldPage) => {
  await fieldPage.validateReference()
})
