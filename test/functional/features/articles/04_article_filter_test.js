Feature('Articles Page Filter - @smoke')

BeforeSuite(async (articlePage, loginPage) => {
  await articlePage.deleteDocument('This Is A New Article')
  await articlePage.deleteDocument('This Article Is Updated')
  await articlePage.deleteDocument('Rich Text')
  await articlePage.deleteDocument('Inline Image')
  await loginPage.deleteUser('filter')
  await loginPage.addUser('filter', '123456', ['collection:cloud_articles',
    'collection:cloud_team',
    'collection:cloud_categories',
    'collection:cloud_sub-categories',
    'collection:cloud_web-services',
    'collection:cloud_network-services'
  ])
  await loginPage.createSession('filter', '123456', '/articles')
})

AfterSuite(async (I, loginPage) => {
  await I.clearCookie('accessToken')
  await loginPage.deleteUser('filter')
})

Scenario('Test Filter', async (articlePage) => {
  await articlePage.validateArticlePage()
  await articlePage.filterArticle()
})