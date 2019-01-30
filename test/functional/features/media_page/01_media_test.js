Feature('Media Page - @smoke')

BeforeSuite(async (loginPage, mediaPage) => {
  await mediaPage.insertMedia('test/functional/images/girl.jpeg')
  await mediaPage.insertMedia('test/functional/images/funny-dog-face-1.jpg')
  await loginPage.deleteUser('media')
  await loginPage.addUser('media', '123456', ['media:mediaStore'])
  await loginPage.createSession('media', '123456', '/media')
})

AfterSuite(async (I, loginPage) => {
  await I.clearCookie('accessToken')
  await loginPage.deleteUser('media')
})

Scenario('Add Media', async (mediaPage) => {
  await mediaPage.addMedia()
})

Scenario('Select Media', async (mediaPage) => {
  await mediaPage.selectMedia()
})

Scenario('Delete Media', async (mediaPage) => {
  await mediaPage.deleteMedia()
})