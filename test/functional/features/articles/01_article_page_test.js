Feature('Articles Page - @smoke')

BeforeSuite(async (articlePage, loginPage) => {
  await articlePage.deleteDocument('This Is A New Article')
  await articlePage.deleteDocument('This Article Is Updated')
  await loginPage.deleteUser('syst_two')
  await loginPage.addUser('syst_two', '123456', [
    'collection:cloud_articles',
    'collection:cloud_team',
    'collection:cloud_categories',
    'collection:cloud_sub-categories',
    'collection:cloud_web-services',
    'collection:cloud_network-services'
  ])
  await loginPage.createSession('syst_two', '123456', '/articles')
})

AfterSuite(async (I, loginPage) => {
  await I.clearCookie('accessToken')
  await loginPage.deleteUser('syst_two')
})

Scenario('Create Article', async articlePage => {
  await articlePage.validateArticlePage()
  await articlePage.addArticle()
})

Scenario('Edit Article', async articlePage => {
  await articlePage.editArticle()
})

Scenario('Delete Article', async articlePage => {
  await articlePage.deleteArticle()
})
