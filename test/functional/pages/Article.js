'use strict'

const {assert, expect} = require('chai')
const moment = require('moment')
const _ = require('lodash')

let I

module.exports = {
  _init() {
    I = require('../stepDefinitions/steps_file.js')()
  },

  // insert your locators and methods here
  locators: {
    publishMenu: locate('a')
      .withAttr({
        href: '/'
      })
      .as('Publish Menu'),
    navigationMenu: locate('.//nav').as('Navigation Menu'),
    articleLink: locate('a')
      .withAttr({
        href: '/articles'
      })
      .as('Article Link'),
    articleTitleHeading: locate('a')
      .withText('Title')
      .as('Article Heading'),
    footer: locate('.//footer').as('Article Page Footer'),
    createNewButton: locate('a')
      .withText('Create new')
      .as('Create New Button'),
    articleRows: locate('.//tbody/tr').as('Article Rows'),
    numberOfArticles: locate('.//strong[1]').as('Number Of Articles On Page'),
    totalArticles: locate('.//strong[2]').as('Number Of Articles On Page'),
    signOutButton: locate('button')
      .withText('Sign out')
      .as('Sign Out Button'),
    titleField: locate('div')
      .withAttr({
        'data-field-name': 'title'
      })
      .find('input')
      .as('Title Field'),
    selectAuthor: locate('a')
      .withText('Select existing author')
      .as('Select Author Button'),
    numOfAuthors: locate('//table/tbody/tr/td[2]').as('Number of Authors'),
    numOfCategories: locate('//table/tbody/tr/td[2]').as(
      'Number of Categories'
    ),
    numOfSubCategories: locate('//table/tbody/tr/td[2]').as(
      'Number of Sub Categories'
    ),
    numOfWebServices: locate('//table/tbody/tr/td[2]').as(
      'Number of Web Services'
    ),
    numOfNetworkServices: locate('//table/tbody/tr/td[2]').as(
      'Number of Network Services'
    ),
    addAuthor: locate('button')
      .withText('Add selected document')
      .as('Add The Author'),
    excerptField: locate('div')
      .withAttr({
        'data-field-name': 'excerpt'
      })
      .find('textarea')
      .as('Excerpt Field'),
    bodyField: locate('div[class^="RichEditor__editor"]').as('Body Field'),
    metaTab: locate('a')
      .withText('Meta')
      .as('Meta Tab'),
    metaTitle: locate('div')
      .withAttr({
        'data-field-name': 'metaTitle'
      })
      .find('input')
      .as('Meta Title Field'),
    saveMenu: locate('button[class*="ButtonWithOptions__launcher"]').as(
      'Save Menu'
    ),
    saveGoBack: locate('button')
      .withText('Save and go back')
      .as('Save And Go Back Button'),
    saveArticle: locate('button')
      .withText('Save and continue')
      .as('Save And Continue Button'),
    createdArticle: locate('a')
      .withText('This Is A New Article')
      .as('New Article'),
    signOutArticle: locate('//table/tbody/tr[1]/td[2]/a').as(
      'Sign Out Article'
    ),
    updatedArticle: locate('a')
      .withText('This Article Is Updated')
      .as('Updated Article'),
    slugField: locate('div')
      .withAttr({
        'data-field-name': 'slug'
      })
      .find('input')
      .as('Slugified Field'),
    checkArticle: locate('td')
      .withText('This is the excerpt')
      .as('Select Article'),
    applyButton: locate('button')
      .withText('Apply')
      .as('Apply Button'),
    selectDelete: locate('select[class*="BulkActionSelector"]').as(
      'Select Delete'
    ),
    deleteButton: locate('button')
      .withText('Yes, delete it.')
      .as('Delete Button'),
    selectCategory: locate('a')
      .withText('Select existing category')
      .as('Select Existing Category Button'),
    selectSubCategory: locate('a')
      .withText('Select existing sub category')
      .as('Select Existing Sub Category Button'),
    selectWebService: locate('a')
      .withText('Select existing web service')
      .as('Select Existing Web Service Button'),
    selectNetworkService: locate('a')
      .withText('Select existing network service')
      .as('Select Existing Newtork Service Button'),
    addSelected: locate('button')
      .withText('Add selected document')
      .as('Add Selected Document Button'),
    removeNetworkButton: locate('div')
      .withAttr({
        'data-field-name': 'network-service'
      })
      .find('button')
      .as('Remove Network Service Button'),
    editWebServiceButton: locate('div')
      .withAttr({
        'data-field-name': 'web-service'
      })
      .find('a')
      .withText('Edit')
      .as('Edit Web Service Button'),
    networkService: locate('label')
      .withText('Network service')
      .as('Network Service'),
    webService: locate('label')
      .withText('Web service')
      .as('Web Service'),
    authorPage: locate('a')
      .withText('4')
      .as('Page 4'),
    nevermindButton: locate('a')
      .withText('Nevermind, back to document')
      .as('Back to document'),
    boldButton: locate('button')
      .withText('Bold')
      .as('Bold Button'),
    italicButton: locate('button')
      .withText('Italic')
      .as('Italic Button'),
    linkButton: locate('button')
      .withText('Link')
      .as('Link Button'),
    h1Button: locate('button')
      .withText('Heading 1')
      .as('Header 1 Button'),
    h2Button: locate('button')
      .withText('Heading 2')
      .as('Header 2 Button'),
    quoteButton: locate('button')
      .withText('Quote')
      .as('Blockquote Button'),
    orderedListButton: locate('button')
      .withText('Numbered list')
      .as('Numbered List Button'),
    unOrderedListButton: locate('button')
      .withText('Bulleted list')
      .as('Bullet Point Button'),
    codeButton: locate('button')
      .withText('Code')
      .as('Code Button'),
    imageButton: locate('button')
      .withText('Media')
      .as('Image Button'),
    fullScreenButton: locate('button')
      .withText('Full-screen')
      .as('Full Screen Button'),
    textButton: locate('button')
      .withText('Raw mode')
      .as('Text Button'),
    boldText: locate('span')
      .withText('Bold')
      .inside('strong')
      .as('Bold Text'),
    italicText: locate('span')
      .withText('Italic')
      .inside('em')
      .as('Italic Text'),
    textArea: locate('div[class*="RichEditor__editor-wysiwyg"]').as(
      'Rich Editor Text'
    ),
    markdownText: locate('div[role*="textbox"]').as('Markdown Text'),
    quoteText: locate('span')
      .withText('Blockquote')
      .inside('blockquote')
      .as('Blockquote Text'),
    linkText: locate('a')
      .withAttr({href: 'www.link.com'})
      .as('Link Text'),
    orderedList1: locate('span')
      .withText('Point 1')
      .inside('li')
      .inside('ol')
      .as('Ordered List Item 1'),
    orderedList2: locate('span')
      .withText('Point 2')
      .inside('li')
      .inside('ol')
      .as('Ordered List Item 2'),
    unorderedList1: locate('span')
      .withText('Bullet 1')
      .inside('li')
      .inside('ul')
      .as('Unordered List Item 1'),
    unorderedList2: locate('span')
      .withText('Bullet 2')
      .inside('li')
      .inside('ul')
      .as('Unordered List Item 2'),
    linkField: locate('input[class*="RichEditorLink__input"]').as('Link Field'),
    filterButton: locate('button[class*="DocumentFilters__button"]').as(
      'Filter Button'
    ),
    filterForm: locate('form[class*="DocumentFilters__tooltip"]').as(
      'Add Filter Form'
    ),
    filterField: locate(
      'select[class*="DocumentFilters__tooltip-dropdown-left"]'
    ).as('Filter Field'),
    filterOperator: locate(
      'select[class*="DocumentFilters__tooltip-dropdown-right"]'
    ).as('Filter Operator'),
    filterValue: locate('input[class*="FieldString__filter-input"]').as(
      'Search Value'
    ),
    addFilter: locate('button[class*="DocumentFilters__tooltip"]')
      .withText('Add filter')
      .as('Add Filter Button'),
    updateFilter: locate('button[class*="DocumentFilters__tooltip"]')
      .withText('Update filter')
      .as('Update Filter Button'),
    filterWrapper: locate('div[class*="DocumentFilters__filter-wrapper"]').as(
      'Filtered Detail'
    ),
    titles: locate('//table/tbody/tr/td[2]').as('Article Titles'),
    dateTime: locate('//table/tbody/tr/td[3]').as('Date & Time'),
    published: locate('//table/tbody/tr/td[4]').as('Published?'),
    filterClose: locate('button[class*="DocumentFilters__filter-close"]').as(
      'Filter Close Button'
    ),
    filterValueSelect: locate(
      'select[class*="DropdownNative__dropdown-text-small"]'
    )
      .withText('No')
      .as('Filter Value Select'),
    dateTimeValue: locate('input[class*="FieldDateTime__filter-input"]').as(
      'Date Time Filter Field'
    ),
    navMenu: locate('nav[class*="Nav"]').as('Navigation Menu'),
    dogImage: locate('img[src*="dog"]').as('Dog Image'),
    insertButton: locate('button')
      .withText('Insert items')
      .as('Insert Items Button'),
    mediaModal: locate('div[class*="ReactModal__Content"]').as('Media Modal')
  },

  async validateArticlePage() {
    await I.amOnPage('/articles')
    await I.waitForVisible(this.locators.articleTitleHeading)
    await I.waitForElement(this.locators.footer)
    await I.seeElement(this.locators.createNewButton)
    let articles = await I.grabNumberOfVisibleElements(
      this.locators.articleRows
    )
    let navItems = await I.grabTextFrom(this.locators.navMenu)
    await I.seeStringsAreEqual(
      navItems,
      'ArticlesContentTaxonomyWeb servicesNetwork servicesMedia Library'
    )
    await I.seeNumberOfVisibleElements(this.locators.articleRows, articles)
    let range = await I.grabTextFrom(this.locators.numberOfArticles)
    let number = range.substring(2, 4).trim()
    await I.seeNumbersAreEqual(articles.toString(), number)
  },

  async addArticle() {
    let total = await I.grabTextFrom(this.locators.totalArticles)
    I.click(this.locators.createNewButton)
    I.waitForFunction(() => document.readyState === 'complete')
    I.seeInCurrentUrl('/articles/new')
    I.fillField(this.locators.titleField, 'This Is A New Article')
    I.fillField(this.locators.excerptField, 'This is the excerpt')
    I.fillField(this.locators.bodyField, 'This is the body of the new article')
    I.click(this.locators.saveArticle)
    I.waitForText('The document has been created', 2)
    I.click(this.locators.selectAuthor)
    I.waitForFunction(() => document.readyState === 'complete')
    I.seeInCurrentUrl('/select/author')
    I.waitForText('Author')
    I.click(this.locators.nevermindButton)
    I.waitForFunction(() => document.readyState === 'complete')
    I.dontSeeInCurrentUrl('/select/author')
    I.seeInField(this.locators.titleField, 'This Is A New Article')

    // Select Author
    I.click(this.locators.selectAuthor)
    I.waitForFunction(() => document.readyState === 'complete')
    I.seeInCurrentUrl('/select/author')
    I.waitForText('Author')
    let numberAuthors = await I.grabNumberOfVisibleElements(
      this.locators.numOfAuthors
    )
    I.seeNumbersAreEqual(numberAuthors, 5)
    let authorsNames = await I.grabTextFrom(this.locators.numOfAuthors)
    I.click(locate('//tbody/tr[2]/td[1]').as('Selected Author'))
    I.click(this.locators.addAuthor)
    I.waitForFunction(() => document.readyState === 'complete')
    I.see(authorsNames[1].trim())

    // Select Category
    I.click(this.locators.selectCategory)
    I.waitForFunction(() => document.readyState === 'complete')
    I.seeInCurrentUrl('/select/category')
    I.waitForText('Category')
    let numberCategories = await I.grabNumberOfVisibleElements(
      this.locators.numOfCategories
    )
    I.seeNumbersAreEqual(numberCategories, 5)
    let categoryNames = await I.grabTextFrom(this.locators.numOfCategories)
    I.click(
      locate('//td[2]').withText(categoryNames[3].trim())
      // .as('Selected Category')
    )
    I.click(this.locators.addSelected)
    I.waitForFunction(() => document.readyState === 'complete')
    I.see(categoryNames[3].trim())

    // Select Sub Category
    I.scrollTo(this.locators.selectSubCategory)
    I.click(this.locators.selectSubCategory)
    I.waitForFunction(() => document.readyState === 'complete')
    I.seeInCurrentUrl('/select/sub-category')
    I.waitForText('Sub category')
    let numberSubCategories = await I.grabNumberOfVisibleElements(
      this.locators.numOfSubCategories
    )
    I.seeNumbersAreEqual(numberSubCategories, 5)
    let subCategoryNames = await I.grabTextFrom(
      this.locators.numOfSubCategories
    )
    I.click(
      locate('//td[2]').withText(subCategoryNames[1].trim())
      // .as('Selected Sub Category')
    )
    I.click(this.locators.addSelected)
    I.waitForFunction(() => document.readyState === 'complete')
    I.see(subCategoryNames[1].trim())

    // Select Web Services
    I.scrollTo(this.locators.selectWebService)
    I.click(this.locators.selectWebService)
    I.waitForFunction(() => document.readyState === 'complete')
    I.seeInCurrentUrl('/select/web-service')
    let numberWebServices = await I.grabNumberOfVisibleElements(
      this.locators.numOfWebServices
    )
    I.seeNumbersAreEqual(numberWebServices, 5)
    let webServicesNames = await I.grabTextFrom(this.locators.numOfWebServices)
    I.click(
      locate('td')
        .before('//td[.="' + webServicesNames[0].trim() + '"]')
        .as('First Selected Web Service')
    )
    I.click(
      locate('td')
        .before('//td[.="' + webServicesNames[4].trim() + '"]')
        .as('Second Selected Web Service')
    )
    I.click(this.locators.addSelected)
    I.waitForFunction(() => document.readyState === 'complete')
    I.scrollTo(this.locators.webService)
    I.see(webServicesNames[0].trim())
    I.see(webServicesNames[4].trim())

    //Select Network Service
    I.scrollTo(this.locators.selectNetworkService)
    I.click(this.locators.selectNetworkService)
    I.waitForFunction(() => document.readyState === 'complete')
    I.seeInCurrentUrl('/select/network-service')
    I.waitForText('Network service')
    let numberNetworkServices = await I.grabNumberOfVisibleElements(
      this.locators.numOfNetworkServices
    )
    I.seeNumbersAreEqual(numberNetworkServices, 5)
    let networkServicesNames = await I.grabTextFrom(
      this.locators.numOfNetworkServices
    )
    I.click(
      locate('td')
        .before('//td[.="' + networkServicesNames[3].trim() + '"]')
        .as('Selected Network Service')
    )
    I.click(this.locators.addSelected)
    I.waitForFunction(() => document.readyState === 'complete')
    I.scrollTo(this.locators.networkService)
    I.see(networkServicesNames[3].trim())

    // Remove Network Service
    I.click(this.locators.removeNetworkButton)
    I.seeElement(this.locators.selectNetworkService)
    I.click(this.locators.metaTab)
    I.waitForFunction(() => document.readyState === 'complete')
    I.seeInCurrentUrl('/meta')
    I.fillField(this.locators.metaTitle, 'This Is A New Article')
    I.click(this.locators.saveMenu)
    I.click(this.locators.saveGoBack)
    I.waitForText('The document has been updated')
    I.seeInCurrentUrl('/articles')
    I.see('This Is A New Article')

    // Ensure total number of articles has increased
    let newTotal = await I.grabTextFrom(this.locators.totalArticles)
    I.seeTotalHasIncreased(newTotal, total)
  },

  async editArticle() {
    let link = await I.grabAttributeFrom(this.locators.createdArticle, 'href')
    let start = link.indexOf('/articles/')
    let id = link.slice(start)
    I.click(this.locators.createdArticle)
    I.seeInCurrentUrl(id)
    let slug = await I.grabValueFrom(this.locators.slugField)
    I.seeStringsAreEqual(slug, 'this-is-a-new-article')
    I.fillField(this.locators.titleField, '')
    I.fillField(this.locators.titleField, 'This Article Is Updated')
    I.scrollTo(this.locators.webService)
    I.click(this.locators.editWebServiceButton)
    I.waitForFunction(() => document.readyState === 'complete')
    I.seeInCurrentUrl('/select/web-service')
    I.waitForText('Web service')
    let webServicesNames = await I.grabTextFrom(this.locators.numOfWebServices)
    I.click(
      locate('td')
        .before('//td[.="' + webServicesNames[4].trim() + '"]')
        .as('Second Selected Web Service')
    )
    I.wait(1)
    I.click(this.locators.addSelected)
    I.waitForFunction(() => document.readyState === 'complete')
    I.scrollTo(this.locators.webService)
    I.see(webServicesNames[0].trim())
    I.dontSee(webServicesNames[4].trim())
    I.click(this.locators.saveMenu)
    I.click(this.locators.saveGoBack)
    I.waitForText('The document has been updated', 2)
    I.seeInCurrentUrl('/articles')
    I.see('This Article Is Updated')
    I.click(this.locators.updatedArticle)
    I.seeInCurrentUrl(id)
    let updatedSlug = await I.grabValueFrom(this.locators.slugField)
    I.seeStringsAreEqual(updatedSlug, 'this-article-is-updated')
    I.click(this.locators.articleLink)
  },

  async filterArticle() {
    let originalArticles = await I.grabNumberOfVisibleElements(
      this.locators.articleRows
    )
    let articleDateTimes = await I.grabTextFrom(this.locators.dateTime)
    let randomNum = _.random(0, 10)
    let pastDateFilter = moment(new Date(), 'YYYY/MM/DD').subtract(
      randomNum,
      'months'
    )
    pastDateFilter = pastDateFilter.format('YYYY/MM/DD 09:00')
    let datesToFilter = await articleDateTimes.filter(
      datetime => datetime > pastDateFilter
    )
    let dateFilter = datesToFilter.length
    let articlePublished = await I.grabTextFrom(this.locators.published)
    let yesPublish = await articlePublished.filter(article => article === 'Yes')
    let noPublish = await articlePublished.filter(article => article === 'No')
    let numberYes = yesPublish.length
    let numberNo = noPublish.length
    I.click(this.locators.filterButton)
    I.seeElement(this.locators.filterForm)
    I.seeElement(this.locators.filterField)
    I.seeElement(this.locators.filterOperator)
    I.fillField(this.locators.filterValue, 'DADI')
    I.click(this.locators.addFilter)
    I.seeElement(this.locators.filterWrapper)
    let articles = await I.grabNumberOfVisibleElements(
      this.locators.articleRows
    )
    I.seeNumbersAreEqual(articles, 3)
    let articleTitles = await I.grabTextFrom(this.locators.titles)
    I.click(this.locators.filterWrapper)
    I.selectOption(this.locators.filterOperator, 'is')
    I.fillField(this.locators.filterValue, articleTitles[1])
    I.click(this.locators.updateFilter)
    let updatedArticles = await I.grabNumberOfVisibleElements(
      this.locators.articleRows
    )
    I.seeNumbersAreEqual(updatedArticles, 1)
    I.click(this.locators.filterClose)
    let newTotal = await I.grabNumberOfVisibleElements(
      this.locators.articleRows
    )
    I.seeNumbersAreEqual(originalArticles, newTotal)
    I.click(this.locators.filterButton)
    I.seeElement(this.locators.filterForm)
    I.selectOption(this.locators.filterField, 'Published')
    I.seeElement(this.locators.filterOperator)
    I.click(this.locators.addFilter)
    I.seeElement(this.locators.filterWrapper)
    let publishedNo = await I.grabNumberOfVisibleElements(
      this.locators.articleRows
    )
    I.seeNumbersAreEqual(publishedNo, numberNo)
    I.click(this.locators.filterWrapper)
    I.selectOption(this.locators.filterValueSelect, 'Yes')
    I.click(this.locators.updateFilter)
    let publishedYes = await I.grabNumberOfVisibleElements(
      this.locators.articleRows
    )
    I.seeNumbersAreEqual(publishedYes, numberYes)
    I.click(this.locators.filterClose)
    newTotal = await I.grabNumberOfVisibleElements(this.locators.articleRows)
    I.seeNumbersAreEqual(originalArticles, newTotal)
    I.click(this.locators.filterButton)
    I.seeElement(this.locators.filterForm)
    I.selectOption(this.locators.filterField, 'Date & Time')
    I.seeElement(this.locators.filterOperator)
    I.selectOption(this.locators.filterOperator, 'is after')
    I.click(this.locators.dateTimeValue)
    I.fillField(this.locators.dateTimeValue, pastDateFilter)
    I.click(this.locators.filterOperator)
    I.click(this.locators.addFilter)
    I.seeElement(this.locators.filterWrapper)
    let datesAfter = await I.grabNumberOfVisibleElements(
      this.locators.articleRows
    )
    I.seeNumbersAreEqual(datesAfter, dateFilter)
  },

  async deleteArticle() {
    let total = await I.grabTextFrom(this.locators.totalArticles)
    I.click(this.locators.checkArticle)
    I.selectOption(this.locators.selectDelete, 'Delete (1)')
    I.click(this.locators.applyButton)
    I.waitForText('Are you sure you want to delete the selected document?')
    I.pressKey('Enter')
    I.waitForText('The document has been deleted', 2)
    I.dontSee('This Article Is Updated')
    let newTotal = await I.grabTextFrom(this.locators.totalArticles)
    I.seeTotalHasDecreased(newTotal, total)
  },

  async newSignOut() {
    I.click(this.locators.createNewButton)
    I.waitForFunction(() => document.readyState === 'complete')
    I.seeInCurrentUrl('/articles/new')
  },

  async editSignOut() {
    let link = await I.grabAttributeFrom(this.locators.signOutArticle, 'href')
    let start = link.indexOf('/articles/')
    let id = link.slice(start)
    I.click(this.locators.signOutArticle)
    I.seeInCurrentUrl(id)
  },

  async insertDocument(body, excerpt, title) {
    await I.createArticle(body, excerpt, title)
  },

  async deleteDocument(title) {
    await I.deleteArticleByTitle(title)
  },

  async insertAuthor(name, body) {
    await I.createTeam(name, body)
  },

  async deleteAuthor(name) {
    await I.deleteTeam(name)
  },

  async insertCategory(name, desc) {
    await I.createCategory(name, desc)
  },

  async insertSubCategory(name) {
    await I.createSubCategory(name)
  },

  async insertNetworkService(name, overview) {
    await I.createNetworkService(name, overview)
  },

  async insertWebService(name, overview) {
    await I.createWebService(name, overview)
  },

  async richTextInput() {
    await I.amOnPage('/articles/new')
    await I.waitForFunction(() => document.readyState === 'complete')
    await I.seeInCurrentUrl('/articles/new')
    await I.waitForVisible(this.locators.titleField)
    await I.fillField(this.locators.titleField, 'Rich Text')

    // Bold
    await I.typeAndSelect(this.locators.bodyField, 'Bold')
    await I.click(this.locators.boldButton)
    await I.appendField(this.locators.bodyField, '  ')
    await I.click(this.locators.boldButton)
    await I.pressKey('Enter')
    await I.pressKey('Enter')
    // Italic
    await I.typeAndSelect(this.locators.bodyField, 'Italic')
    await I.click(this.locators.italicButton)
    await I.appendField(this.locators.bodyField, '  ')
    await I.click(this.locators.italicButton)
    await I.pressKey('Enter')
    await I.pressKey('Enter')
    // H1
    await I.typeAndSelect(this.locators.bodyField, 'Header 1')
    await I.click(this.locators.h1Button)
    await I.appendField(this.locators.bodyField, '')
    await I.pressKey('Enter')
    await I.pressKey('Enter')
    // H2
    await I.appendField(this.locators.bodyField, '')
    await I.typeAndSelect(this.locators.bodyField, 'Header 2')
    await I.click(this.locators.h2Button)
    await I.appendField(this.locators.bodyField, '  ')
    await I.pressKey('Enter')
    await I.pressKey('Enter')
    // Blockquote
    await I.appendField(this.locators.bodyField, '')
    await I.typeAndSelect(this.locators.bodyField, 'Blockquote')
    await I.click(this.locators.quoteButton)
    await I.appendField(this.locators.bodyField, '  ')
    await I.pressKey('Enter')
    await I.pressKey('Enter')
    // Link
    await I.appendField(this.locators.bodyField, '')
    await I.typeAndSelect(this.locators.bodyField, 'Link')
    await I.click(this.locators.linkButton)
    await I.waitForElement(this.locators.linkField)
    await I.fillField(this.locators.linkField, 'www.link.com')
    await I.pressKey('Enter')
    await I.appendField(this.locators.bodyField, '  ')
    await I.pressKey('Enter')
    // Ordered List
    await I.click(this.locators.orderedListButton)
    await I.fillField(this.locators.bodyField, 'Point 1')
    await I.pressKey('Enter')
    await I.fillField(this.locators.bodyField, 'Point 2')
    await I.pressKey('Enter')
    await I.click(this.locators.orderedListButton)
    // Unordered List
    await I.click(this.locators.unOrderedListButton)
    await I.fillField(this.locators.bodyField, 'Bullet 1')
    await I.pressKey('Enter')
    await I.fillField(this.locators.bodyField, 'Bullet 2')
    await I.pressKey('Enter')
    await I.click(this.locators.unOrderedListButton)

    await I.click(this.locators.saveArticle)
    await I.waitForText('The document has been created', 2)

    await I.seeElement(this.locators.boldText)
    await I.seeElement(this.locators.italicText)
    await I.seeElement(this.locators.quoteText)
    await I.seeElement(this.locators.linkText)
    await I.seeElement(this.locators.orderedList1)
    await I.seeElement(this.locators.orderedList2)
    await I.seeElement(this.locators.unorderedList1)
    await I.seeElement(this.locators.unorderedList2)

    // (!) TO DO: We need a better way of testing the rich editor. Currently,
    // it works by typing *and* selecting text at the same time, which means
    // that styles are being persisted across paragraphs. Ideally, we'd type
    // and only then select different portions of the text and apply the
    // formats. Until that's done, the Markdown output will be messy and
    // probably not worth testing.
    //    -- eb (07/06/2019)
    // await I.click(this.locators.textButton)
    // I.wait(2)
    // await I.see('**Bold** _Italic_')
    // await I.see('# Header 1')
    // await I.see('## Header 2')
    // await I.see('> Blockquote')
    // await I.see('[Link](www.link.com)')
    // await I.see('1. Point 1')
    // await I.see('1. Point 2')
    // await I.see('* Bullet 1')
    // await I.see('* Bullet 2')
  },

  async inlineImage() {
    await I.amOnPage('/articles/new')
    await I.waitForFunction(() => document.readyState === 'complete')
    await I.seeInCurrentUrl('/articles/new')
    await I.waitForVisible(this.locators.titleField)
    await I.fillField(this.locators.titleField, 'Inline Image')

    // Inline Image
    await I.appendField(this.locators.bodyField, '')
    await I.click(this.locators.imageButton)
    await I.seeElement(this.locators.mediaModal)
    await I.click(this.locators.dogImage)
    await I.click(this.locators.insertButton)
    await I.click(this.locators.saveArticle)
    await I.waitForText('The document has been created', 2)
    // Get today's date for URL
    let year = await moment(new Date()).format('YYYY')
    let month = await moment(new Date()).format('MM')
    let day = await moment(new Date()).format('DD')
    let imageLink = await I.grabAttributeFrom(this.locators.dogImage, 'src')
    let expectedImageLink =
      'http://localhost:3004/media/' +
      year +
      '/' +
      month +
      '/' +
      day +
      '/dog.jpg'
    await I.seeStringContains(imageLink, expectedImageLink)
    // markdown view
    await I.click(this.locators.textButton)
    await I.seeElement(this.locators.markdownText)
    let imageText = await I.grabTextFrom(this.locators.markdownText)
    await I.seeStringsAreEqual(imageText, '![](' + expectedImageLink + ')')
  }
}
