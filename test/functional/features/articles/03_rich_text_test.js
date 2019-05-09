Feature('Rich Text Editor - @smoke')

BeforeSuite(async (articlePage, loginPage, mediaPage) => {
  await mediaPage.insertMedia('test/functional/images/girl.png')
  await mediaPage.insertMedia('test/functional/images/dog.jpg')
  await articlePage.deleteDocument('Rich Text')
  await articlePage.deleteDocument('Inline Image')
  await loginPage.deleteUser('rich_text')
  await loginPage.addUser('rich_text', '123456', ['collection:cloud_articles',
    'collection:cloud_team',
    'collection:cloud_categories',
    'collection:cloud_sub-categories',
    'collection:cloud_web-services',
    'collection:cloud_network-services',
    'media:mediaStore'
  ])
  await loginPage.createSession('rich_text', '123456', '/articles/new')
})

AfterSuite(async (I, loginPage, mediaPage) => {
  await mediaPage.deleteAllMedia('dog.jpg')
  await mediaPage.deleteAllMedia('girl.png')
  await I.clearCookie('accessToken')
  await loginPage.deleteUser('rich_text')
})

Scenario('Rich Text', async (articlePage) => {
  await articlePage.richTextInput()
})

Scenario('Inline Image', async (articlePage) => {
  await articlePage.inlineImage()
})