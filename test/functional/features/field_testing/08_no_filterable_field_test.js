Feature('No Filterable Field Test Page - @smoke')

BeforeSuite(async (fieldPage, loginPage) => {
  await loginPage.deleteUser('no-filter')
  await loginPage.addUser('no-filter', '123456', ['collection:cloud_no-filterable-fields'])
  await loginPage.createSession('no-filter', '123456', '/field-testing/no-filterable-fields')
})

AfterSuite(async (I, loginPage) => {
  await I.clearCookie('accessToken')
  await loginPage.deleteUser('no-filter')
})

Scenario('No Filterabe Field Validation Tests', async (fieldPage) => {
  await fieldPage.validateNoFilter()
})
