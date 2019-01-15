Feature('Sign Out From Article - @smoke')

BeforeSuite(async (articlePage, loginPage) => {
  await loginPage.deleteUser('syst_five')
  await loginPage.addUser('syst_five', '123456')
})

AfterSuite(async (I, loginPage) => {
  await I.clearCookie('accessToken')
  await loginPage.deleteUser('syst_five')
})

Before(async (loginPage) => {
  await loginPage.createSession('syst_five', '123456', '/articles')
})

After(async (loginPage) => {})

Scenario('New Article Sign Out', async (articlePage, loginPage) => {
  await articlePage.validateArticlePage()
  await articlePage.newSignOut()
  await loginPage.validateSignOut()
})

Scenario('Edit Article Sign Out', async (articlePage, loginPage) => {
  await articlePage.validateArticlePage()
  await articlePage.editSignOut()
  await loginPage.validateSignOut()
})