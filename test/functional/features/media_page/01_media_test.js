Feature('Media Page - @smoke')

BeforeSuite(async (loginPage, mediaPage) => {
  await mediaPage.insertMedia('test/functional/images/girl.png')
  await mediaPage.insertMedia('test/functional/images/dog.jpg')
  await loginPage.deleteUser('media')
  await loginPage.addUser('media', '123456', ['media:mediaStore'])
  await loginPage.createSession('media', '123456', '/media')
})

AfterSuite(async (I, loginPage, mediaPage) => {
  await mediaPage.deleteAllMedia('dog.jpg')
  await mediaPage.deleteAllMedia('girl.png')
  await I.clearCookie('accessToken')
  await loginPage.deleteUser('media')
})

Scenario('Add Media', async mediaPage => {
  await mediaPage.addMedia()
})

Scenario('Select Media', async mediaPage => {
  await mediaPage.selectMedia()
})

Scenario('Filter Media', async mediaPage => {
  await mediaPage.filterMedia()
})

Scenario('Delete Media', async mediaPage => {
  await mediaPage.deleteMedia()
})
