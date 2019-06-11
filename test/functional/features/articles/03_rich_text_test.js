Feature('Rich Text Editor - @smoke')

BeforeSuite(async (articlePage, loginPage) => {
  await articlePage.deleteDocument('Rich Text')
  await loginPage.deleteUser('rich_text')
  await loginPage.addUser('rich_text', '123456', [
    'collection:cloud_articles',
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

Scenario('Rich Text', async articlePage => {
  await articlePage.richTextInput()
})
