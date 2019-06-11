Feature('Media Field Test Page - @smoke')

BeforeSuite(async (mediaPage, fieldPage, loginPage) => {
  await mediaPage.insertMedia('test/functional/images/Stone.jpeg')
  await mediaPage.insertMedia('test/functional/images/Watson.jpeg')
  await mediaPage.insertMedia('test/functional/images/dog.jpg')
  await mediaPage.insertMedia('test/functional/images/DADI_Publish.pdf')
  await mediaPage.insertMedia('test/functional/images/girl.png')
  await loginPage.deleteUser('media-field')
  await loginPage.addUser('media-field', '123456', [
    'media:mediaStore',
    'collection:cloud_field-test-media'
  ])
  await loginPage.createSession(
    'media-field',
    '123456',
    '/field-testing/field-test-media'
  )
})

AfterSuite(async (I, loginPage, mediaPage) => {
  await mediaPage.deleteAllMedia('Stone.jpeg')
  await mediaPage.deleteAllMedia('Watson.jpeg')
  await mediaPage.deleteAllMedia('dog.jpg')
  await mediaPage.deleteAllMedia('DADI_Publish.pdf')
  await mediaPage.deleteAllMedia('girl.png')
  await I.clearCookie('accessToken')
  await loginPage.deleteUser('media-field')
})

Scenario('Media Field Validation Tests', async fieldPage => {
  await fieldPage.validateMedia()
})
