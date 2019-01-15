const api = require('./../../../api')
const publish = require('./../../../../index')

Feature('Articles Page - @smoke')

BeforeSuite(async (articlePage, loginPage) => {
  await api.start()
  await publish.run()
  await articlePage.deleteDocument('This Is A New Article')
  await articlePage.deleteDocument('This Article Is Updated')
  await loginPage.deleteUser('syst_two')
  await loginPage.addUser('syst_two', '123456')
  await loginPage.createSession('syst_two', '123456', '/articles')
})

AfterSuite(async (I, loginPage) => {
  await I.clearCookie('accessToken')
  await loginPage.deleteUser('syst_two')
  await api.stop()
})

Before(async (loginPage) => {
})

After(async (loginPage) => {
})

Scenario('Create Article', async (articlePage, homePage, loginPage) => {
  await articlePage.validateArticlePage()
  await articlePage.addArticle()
})

Scenario('Edit Article', async (articlePage, homePage, loginPage) => {
  await articlePage.editArticle()
})

Scenario('Delete Article', async (articlePage, homePage, loginPage) => {
  await articlePage.deleteArticle()
})