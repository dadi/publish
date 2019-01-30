Feature('Articles Page - @smoke')

BeforeSuite(async (articlePage, loginPage) => {
  await articlePage.deleteDocument('This Is A New Article')
  await articlePage.deleteDocument('This Article Is Updated')
  await articlePage.insertDocument('Test body one', 'Test excerpt one', 'Test Title One')
  await articlePage.insertDocument('Test body two', 'Test excerpt two', 'Test Title Two')
  await articlePage.insertAuthor('Joe Bloggs', 'Author')
  await articlePage.insertCategory('Knowledge', 'Information, core principles and general light reading on DADI technology')
  await articlePage.insertSubCategory('Network')
  await articlePage.insertNetworkService('Host', 'Provide processing power for multiple Consumer app bundles.')
  await articlePage.insertWebService('API', 'A high-performance RESTful API layer designed in support of API-first development and COPE.')
  await articlePage.insertWebService('CDN', 'A just-in-time asset manipulation and delivery layer designed for faster content distribution.')
  await loginPage.deleteUser('syst_two')
  await loginPage.addUser('syst_two', '123456', ['collection:cloud_articles',
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

Scenario('Create Article', async (articlePage) => {
  await articlePage.validateArticlePage()
  await articlePage.addArticle()
})

Scenario('Edit Article', async (articlePage) => {
  await articlePage.editArticle()
})

Scenario('Delete Article', async (articlePage) => {
  await articlePage.deleteArticle()
})