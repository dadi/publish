Feature('Sign Out From Article - @smoke')

BeforeSuite(async (articlePage, loginPage) => {
  await articlePage.insertDocument('Test body one', 'Test excerpt one', 'Test Title One')
  await articlePage.insertDocument('Test body two', 'Test excerpt two', 'Test Title Two')
  await loginPage.deleteUser('syst_five')
  await loginPage.addUser('syst_five', '123456', ['collection:cloud_articles',
    'collection:cloud_team',
    'collection:cloud_categories',
    'collection:cloud_sub-categories',
    'collection:cloud_web-services',
    'collection:cloud_network-services'
  ])
})

AfterSuite(async (I, loginPage) => {
  await I.clearCookie('accessToken')
  await loginPage.deleteUser('syst_five')
})

Before(async (loginPage) => {
  await loginPage.createSession('syst_five', '123456', '/articles')
})

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