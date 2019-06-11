Feature('Sign In Page - @smoke')

BeforeSuite(async loginPage => {
  await loginPage.deleteUser('syst_one')
  await loginPage.addUser('syst_one', '123456', ['collection:cloud_articles'])
})

AfterSuite(async loginPage => {
  await loginPage.deleteUser('syst_one')
})

Before(async loginPage => {
  await loginPage.validateSignInPage()
})

Scenario('Unauthenticated Page Load', async loginPage => {
  await loginPage.validateUnauthPageLoad()
})

// DataTable to test different combinations of sign in fields
let passwords = new DataTable(['username', 'password'])
passwords.add(['syst_on', '123456'])
passwords.add(['syst_one', '12345'])

Data(passwords).Scenario(
  'Invalid Credentials - Screen Error',
  (current, loginPage) => {
    loginPage.validateInvalidCredentials(current.username, current.password)
  }
)

Scenario('Successful Sign In and Out', async loginPage => {
  await loginPage.validateSignIn('syst_one', '123456')
  await loginPage.validateSignOut()
})
