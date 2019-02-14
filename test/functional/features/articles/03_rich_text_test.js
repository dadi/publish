Feature('Rich Text Editor - @smoke')

BeforeSuite(async (articlePage, loginPage) => {
  await articlePage.deleteDocument('Rich Text')
  await loginPage.deleteUser('rich_text')
  await articlePage.deleteDocument('Test body one')
  await articlePage.deleteDocument('Test body two')
  await articlePage.insertDocument('Test body one', 'Test excerpt one', 'Test Title One')
  await articlePage.insertDocument('Test body two', 'Test excerpt two', 'Test Title Two')
  await loginPage.addUser('rich_text', '123456', ['collection:cloud_articles',
    'collection:cloud_team',
    'collection:cloud_categories',
    'collection:cloud_sub-categories',
    'collection:cloud_web-services',
    'collection:cloud_network-services'
  ])
  await loginPage.createSession('rich_text', '123456', '/articles/new')
})

AfterSuite(async (I, loginPage) => {
  await I.clearCookie('accessToken')
  await loginPage.deleteUser('rich_text')
})

Scenario('Rich Text', async (articlePage) => {
  await articlePage.richTextInput()
})
