Feature('Media Page - @smoke')

BeforeSuite(async (loginPage, mediaPage) => {
  // await mediaPage.insertMedia('test/functional/images/Stone.jpeg')
  await loginPage.deleteUser('media')
  await loginPage.addUser('media', '123456')
  await loginPage.createSession('media', '123456', '/media')
})

AfterSuite(async (I, loginPage) => {
  await I.clearCookie('accessToken')
  await loginPage.deleteUser('media')
})

// Before(async (loginPage) => {})

// After(async (loginPage) => {})

// Scenario('Add Media', async (mediaPage) => {
//   await mediaPage.addMedia()
// })

// Scenario('Select Media', async (mediaPage) => {
//   await mediaPage.selectMedia()
// })

// Scenario('Delete Media', async (mediaPage) => {
//   await mediaPage.deleteMedia()
// })