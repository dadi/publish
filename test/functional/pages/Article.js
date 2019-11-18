'use strict'

const moment = require('moment')
const random = require('../helpers/random')

const I = actor()

module.exports = {
  // insert your locators and methods here
  locators: {
    publishMenu: locate('a')
      .withAttr({
        href: '/'
      })
      .as('Publish Menu'),
    articleLink: locate('a')
      .withAttr({
        href: '/articles'
      })
      .as('Article Link'),
    articleTitleHeading: locate('a')
      .withText('Title')
      .as('Article Heading'),
    footer: locate('footer').as('Article Page Footer'),
    createNewButton: locate('button[data-name="create-new-button"]').as(
      'Create New Button'
    ),
    articleRows: locate('tbody tr').as('Article Rows'),
    numberOfArticles: locate('span strong:nth-child(1)').as(
      'Number Of Articles On Page'
    ),
    totalArticles: locate('span strong:nth-child(2)').as(
      'Number Of Articles On Page'
    ),
    signOutButton: locate('button')
      .withText('Sign out')
      .as('Sign Out Button'),
    titleField: locate('div')
      .withAttr({
        'data-field-name': 'title'
      })
      .find('input')
      .as('Title Field'),
    selectAuthor: locate('div')
      .withAttr({
        'data-field-name': 'author'
      })
      .find('*')
      .withAttr({
        'data-name': 'select-existing-reference-button'
      })
      .as('Select Author Button'),
    editAuthorButton: locate('div')
      .withAttr({
        'data-field-name': 'author'
      })
      .find('*')
      .withAttr({
        'data-name': 'edit-reference-button'
      })
      .as('Edit Author Button'),
    authorNameAsc: locate('*')
      .withAttr({
        'data-name': 'column-header',
        'data-sort-order': 'asc'
      })
      .withText('Name')
      .as('Authors Names Ascending'),
    authorNameDesc: locate('*')
      .withAttr({
        'data-column': 'name',
        'data-name': 'column-header',
        'data-sort-order': 'desc'
      })
      .as('Authors Names Descending'),
    numOfAuthors: locate('td:nth-child(2)').as('Number of Authors'),
    numOfCategories: locate('td:nth-child(2)').as('Number of Categories'),
    numOfSubCategories: locate('td:nth-child(2)').as(
      'Number of Sub Categories'
    ),
    numOfWebServices: locate('td:nth-child(2)').as('Number of Web Services'),
    numOfNetworkServices: locate('td:nth-child(2)').as(
      'Number of Network Services'
    ),
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
    saveMenu: locate('button[class*="ButtonWithOptions__sideButton"]').as(
      'Save Menu'
    ),
    saveGoBack: locate('div[class*="ButtonWithOptions__dropdownItem"]')
      .withText('Save & go back')
      .as('Save & Go Back'),
    save: locate('button[class*="ButtonWithOptions__mainButton"]').as(
      'Save Button'
    ),
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
    applyButton: locate('button[class*="Button__accent--negative"]')
      .withText('Yes, delete it')
      .as('Apply Button'),
    selectDelete: locate('button[data-name*="delete-button"]').as(
      'Select Delete'
    ),
    deleteButton: locate('button')
      .withText('Yes, delete it.')
      .as('Delete Button'),
    selectCategory: locate('div')
      .withAttr({
        'data-field-name': 'category'
      })
      .find('*')
      .withAttr({
        'data-name': 'select-existing-reference-button'
      })
      .as('Select Existing Category Button'),
    selectSubCategory: locate('div')
      .withAttr({
        'data-field-name': 'sub-category'
      })
      .find('*')
      .withAttr({
        'data-name': 'select-existing-reference-button'
      })
      .as('Select Existing Sub Category Button'),
    selectWebService: locate('div')
      .withAttr({
        'data-field-name': 'web-service'
      })
      .find('*')
      .withAttr({
        'data-name': 'select-existing-reference-button'
      })
      .as('Select Existing Web Service Button'),
    selectNetworkService: locate('div')
      .withAttr({
        'data-field-name': 'network-service'
      })
      .find('*')
      .withAttr({
        'data-name': 'select-existing-reference-button'
      })
      .as('Select Existing Network Service Button'),
    saveSelected: locate('*')
      .withAttr({
        'data-name': 'save-reference-selection-button'
      })
      .as('Save Selection Button'),
    removeNetworkButton: locate('div')
      .withAttr({
        'data-field-name': 'network-service'
      })
      .find('*')
      .withAttr({
        'data-name': 'remove-reference-button'
      })
      .as('Remove Network Service Button'),
    editWebServiceButton: locate('div')
      .withAttr({
        'data-field-name': 'web-service'
      })
      .find('*')
      .withAttr({
        'data-name': 'edit-reference-button'
      })
      .as('Edit Web Service Button'),
    removeWebServiceButton: locate('div')
      .withAttr({
        'data-field-name': 'web-service'
      })
      .find('*')
      .withAttr({
        'data-name': 'remove-reference-button'
      })
      .as('Remove Web Service Button'),
    webServiceSelected: locate('a[href*="/web-services/"]').as(
      'Web Service Selected'
    ),
    networkService: locate('label')
      .withText('Network service')
      .as('Network Service'),
    webService: locate('label')
      .withText('Web service')
      .as('Web Service'),
    authorPage: locate('a')
      .withText('4')
      .as('Page 4'),
    cancelButton: locate('button[class*="Button__accent--negative"]').as(
      'Cancel Button'
    ),
    boldButton: locate('*')
      .withAttr({'data-name': 'editor-bold-button'})
      .as('Bold Button'),
    italicButton: locate('*')
      .withAttr({'data-name': 'editor-italic-button'})
      .as('Italic Button'),
    linkButton: locate('*')
      .withAttr({'data-name': 'editor-link-button'})
      .as('Link Button'),
    h1Button: locate('*')
      .withAttr({'data-name': 'editor-h1-button'})
      .as('Header 1 Button'),
    h2Button: locate('*')
      .withAttr({'data-name': 'editor-h2-button'})
      .as('Header 2 Button'),
    h3Button: locate('*')
      .withAttr({'data-name': 'editor-h3-button'})
      .as('Header 3 Button'),
    quoteButton: locate('*')
      .withAttr({'data-name': 'editor-blockquote-button'})
      .as('Blockquote Button'),
    orderedListButton: locate('*')
      .withAttr({'data-name': 'editor-ol-button'})
      .as('Numbered List Button'),
    unOrderedListButton: locate('*')
      .withAttr({'data-name': 'editor-ul-button'})
      .as('Bullet Point Button'),
    codeButton: locate('*')
      .withAttr({'data-name': 'editor-code-button'})
      .as('Code Button'),
    imageButton: locate('*')
      .withAttr({'data-name': 'editor-image-button'})
      .as('Image Button'),
    fullScreenButton: locate('*')
      .withAttr({'data-name': 'editor-fullscreen-button'})
      .as('Full Screen Button'),
    exitFullScreenButton: locate('*')
      .withAttr({'data-name': 'editor-fullscreen-button'})
      .as('Exit Full Screen Button'),
    textButton: locate('*')
      .withAttr({'data-name': 'editor-markdown-button'})
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
    filterButton: locate('button[data-name="add-filter-button"]').as(
      'Filter Button'
    ),
    filterForm: locate('form[class*="DocumentFilters__tooltip"]').as(
      'Add Filter Form'
    ),
    filterField: locate(
      'div[class*="field-selector"] select[class*="Select"]'
    ).as('Filter Field'),
    filterOperator: locate(
      'div[class*="operator-selector"] select[class*="Select"]'
    ).as('Filter Operator'),
    filterValue: locate('input[class*="filter-input"]').as('Search Value'),
    addFilter: locate('button[class*="update-filter-button"]').as(
      'Add Filter Button'
    ),
    updateFilter: locate('button[class*="update-filter-button"]')
      .withText('Update')
      .as('Update Filter Button'),
    filterWrapper: locate(
      'span[class*="DocumentListController__filter-field"]'
    ).as('Filtered Detail'),
    titles: locate('td:nth-child(2)').as('Article Titles'),
    dateTime: locate('td:nth-child(3)').as('Date & Time'),
    published: locate('td:nth-child(4)').as('Published?'),
    filterClose: locate('button[class*="clear-filters-button"]').as(
      'Filter Close Button'
    ),
    filterValueSelect: locate(
      'div[class*="Select__container"] select[class*="Select"]'
    )
      .withText('No')
      .as('Filter Value Select'),
    dateTimeValue: locate('input[class*="FieldDateTime__filter-input"]').as(
      'Date Time Filter Field'
    ),
    navMenu: locate('nav > ul > li').as('Navigation Menu'),
    dogImage: locate('img[src*="dog"]').as('Dog Image'),
    dogImageCheckbox: locate('div[data-filename*="dog"]')
      .find('input[type="checkbox"]')
      .as('Dog Image Checkbox'),
    insertButton: locate(
      'button[data-name*="save-reference-selection-button"]'
    ).as('Insert Items Button'),
    numEditArticles: locate('td:nth-child(2)').as('Number of Articles'),
    delArticleButton: locate('button[class*="delete-button"]').as(
      'Delete Article Button'
    ),
    h1Text: locate('span')
      .withText('Header 1')
      .inside('h1')
      .as('Header 1 Text'),
    h2Text: locate('span')
      .withText('Header 2')
      .inside('h2')
      .as('Header 2 Text'),
    h3Text: locate('span')
      .withText('Header 3')
      .inside('h3')
      .as('Header 3 Text')
  },

  async validateArticlePage() {
    I.amOnPage('/articles')
    I.waitForVisible(this.locators.articleTitleHeading)
    I.waitForElement(this.locators.footer)
    I.seeElement(this.locators.createNewButton)
    const articles = await I.grabNumberOfVisibleElements(
      this.locators.articleRows
    )
    const navItems = await I.grabTextFrom(this.locators.navMenu)

    I.seeStringsAreEqual(
      navItems.toString(),
      'ARTICLES,CONTENT,TAXONOMY,WEB SERVICES,NETWORK SERVICES,MEDIA LIBRARY'
    )
    I.seeNumberOfVisibleElements(this.locators.articleRows, articles)
    const range = await I.grabTextFrom(this.locators.numberOfArticles)
    const number = range.substring(2, 4).trim()

    I.seeNumbersAreEqual(articles.toString(), number)
  },

  async addArticle() {
    const total = await I.grabTextFrom(this.locators.totalArticles)

    I.click(this.locators.createNewButton)
    I.waitForFunction(() => document.readyState === 'complete')
    I.seeInCurrentUrl('/articles/new')
    I.fillField(this.locators.titleField, 'This Is A New Article')
    I.fillField(this.locators.excerptField, 'This is the excerpt')
    I.fillField(this.locators.bodyField, 'This is the body of the new article')
    await I.emulateCommandButtonPressSave()
    I.waitForText('The document has been created', 2)
    I.click(this.locators.selectAuthor)
    I.waitForFunction(() => document.readyState === 'complete')
    I.waitForText('Author')
    I.click(this.locators.cancelButton)
    I.waitForFunction(() => document.readyState === 'complete')
    I.seeInField(this.locators.titleField, 'This Is A New Article')

    // Select Author
    I.click(this.locators.selectAuthor)
    I.waitForFunction(() => document.readyState === 'complete')
    I.waitForText('Author')
    const numberAuthors = await I.grabNumberOfVisibleElements(
      this.locators.numOfAuthors
    )

    I.seeNumbersAreEqual(numberAuthors, 5)
    const authorsNames = await I.grabTextFrom(this.locators.numOfAuthors)

    I.click(locate('//tbody/tr[2]/td[1]').as('Selected Author'))
    I.click(this.locators.saveSelected)
    I.waitForFunction(() => document.readyState === 'complete')
    I.see(authorsNames[1].trim())

    // Select Category
    I.click(this.locators.selectCategory)
    I.waitForFunction(() => document.readyState === 'complete')
    I.waitForText('Category')
    const numberCategories = await I.grabNumberOfVisibleElements(
      this.locators.numOfCategories
    )

    I.seeNumbersAreEqual(numberCategories, 5)
    const categoryNames = await I.grabTextFrom(this.locators.numOfCategories)

    I.click(
      locate('td')
        .before('//td[.="' + categoryNames[3].trim() + '"]')
        .as('Selected Category')
    )
    I.click(this.locators.saveSelected)
    I.waitForFunction(() => document.readyState === 'complete')
    I.see(categoryNames[3].trim())

    // Select Sub Category
    I.scrollTo(this.locators.selectSubCategory)
    I.click(this.locators.selectSubCategory)
    I.waitForFunction(() => document.readyState === 'complete')
    I.waitForText('Sub category')
    const numberSubCategories = await I.grabNumberOfVisibleElements(
      this.locators.numOfSubCategories
    )

    I.seeNumbersAreEqual(numberSubCategories, 5)
    const subCategoryNames = await I.grabTextFrom(
      this.locators.numOfSubCategories
    )

    I.click(
      locate('td')
        .before('//td[.="' + subCategoryNames[1].trim() + '"]')
        .as('Selected Sub Category')
    )
    I.click(this.locators.saveSelected)
    I.waitForFunction(() => document.readyState === 'complete')
    I.see(subCategoryNames[1].trim())

    // Select Web Services
    I.scrollTo(this.locators.selectNetworkService)
    I.click(this.locators.selectWebService)
    I.waitForFunction(() => document.readyState === 'complete')
    const numberWebServices = await I.grabNumberOfVisibleElements(
      this.locators.numOfWebServices
    )

    I.seeNumbersAreEqual(numberWebServices, 5)
    const webServicesNames = await I.grabTextFrom(
      this.locators.numOfWebServices
    )

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
    I.click(this.locators.saveSelected)
    I.waitForFunction(() => document.readyState === 'complete')
    I.scrollTo(this.locators.webService)
    I.see(webServicesNames[0].trim())
    I.see(webServicesNames[4].trim())
    //Select Network Service
    // I.scrollPageToBottom()
    // I.scrollTo(this.locators.selectNetworkService)
    // I.click(this.locators.selectNetworkService)
    // I.waitForFunction(() => document.readyState === 'complete')
    // I.waitForText('Network service')
    // const numberNetworkServices = await I.grabNumberOfVisibleElements(
    //   this.locators.numOfNetworkServices
    // )

    // I.seeNumbersAreEqual(numberNetworkServices, 5)
    // const networkServicesNames = await I.grabTextFrom(
    //   this.locators.numOfNetworkServices
    // )

    // I.click(
    //   locate('td')
    //     .before('//td[.="' + networkServicesNames[3].trim() + '"]')
    //     .as('Selected Network Service')
    // )
    // I.click(this.locators.saveSelected)
    // I.waitForFunction(() => document.readyState === 'complete')
    // I.scrollTo(this.locators.networkService)
    // I.see(networkServicesNames[3].trim())

    // // Remove Network Service
    // I.click(this.locators.removeNetworkButton)
    // I.seeElement(this.locators.selectNetworkService)
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
    const newTotal = await I.grabTextFrom(this.locators.totalArticles)

    I.seeTotalHasIncreased(newTotal, total)
  },

  async editArticle() {
    I.amOnPage('/articles')
    I.waitForVisible(this.locators.articleTitleHeading)
    I.waitForElement(this.locators.footer)
    I.seeElement(this.locators.createNewButton)

    const articlesNames = await I.grabTextFrom(this.locators.numEditArticles)

    I.click(
      locate('span[class*="FieldString__with-ellipsis"]')
        .withText(articlesNames[1].trim())
        .as('Article to Edit')
    )
    I.fillField(this.locators.titleField, '')
    I.fillField(this.locators.titleField, 'This Article Is Updated')
    I.click(this.locators.editAuthorButton)
    I.waitForFunction(() => document.readyState === 'complete')
    I.waitForText('Author')
    const numberAuthors = await I.grabNumberOfVisibleElements(
      this.locators.numOfAuthors
    )

    I.seeNumbersAreEqual(numberAuthors, 5)
    const authorsNames = await I.grabTextFrom(this.locators.numOfAuthors)

    // Sort names alphabetically ascending
    const sortNamesAsc = [...authorsNames].sort()

    // Sort names alphabetically descending
    const sortNamesDesc = [...sortNamesAsc].reverse()

    I.click(this.locators.authorNameAsc)

    const authorsNamesAsc = await I.grabTextFrom(this.locators.numOfAuthors)

    // Check names sorted correctly ascending alphabetically
    I.seeStringsAreEqual(authorsNamesAsc.toString(), sortNamesAsc.toString())

    I.click(this.locators.authorNameDesc)

    const authorsNamesDesc = await I.grabTextFrom(this.locators.numOfAuthors)

    // Check names sorted correctly descending alphabetically
    I.seeStringsAreEqual(authorsNamesDesc.toString(), sortNamesDesc.toString())

    I.click(this.locators.saveSelected)
    I.waitForFunction(() => document.readyState === 'complete')
    I.scrollTo(this.locators.webService)
    const wsSelected = await I.grabTextFrom(this.locators.webServiceSelected)

    I.click(this.locators.removeWebServiceButton)
    I.dontSee(wsSelected)
    I.click(this.locators.saveMenu)
    I.click(this.locators.saveGoBack)
    I.waitForText('The document has been updated', 2)
    I.seeInCurrentUrl('/articles')
    I.dontSee(articlesNames[1])
    I.see('This Article Is Updated')
    I.click(
      locate('span[class*="FieldString__with-ellipsis"]')
        .withText('This Article Is Updated')
        .as('Updated Link')
    )
    const updatedSlug = await I.grabValueFrom(this.locators.slugField)

    I.seeStringsAreEqual(updatedSlug, 'this-article-is-updated')
  },

  async filterArticle() {
    const originalArticles = await I.grabNumberOfVisibleElements(
      this.locators.articleRows
    )
    const articleDateTimes = await I.grabTextFrom(this.locators.dateTime)
    const randomNum = random(0, 10)
    let pastDateFilter = moment(new Date(), 'YYYY/MM/DD').subtract(
      randomNum,
      'months'
    )

    pastDateFilter = pastDateFilter.format('YYYY/MM/DD 09:00')
    const datesToFilter = await articleDateTimes.filter(
      datetime => datetime > pastDateFilter
    )
    const dateFilter = datesToFilter.length
    const articlePublished = await I.grabTextFrom(this.locators.published)
    const yesPublish = await articlePublished.filter(
      article => article === 'Yes'
    )
    const noPublish = await articlePublished.filter(article => article === 'No')
    const numberYes = yesPublish.length
    const numberNo = noPublish.length

    I.click(this.locators.filterButton)
    I.seeElement(this.locators.filterField)
    I.seeElement(this.locators.filterOperator)
    I.fillField(this.locators.filterValue, 'DADI')
    I.click(this.locators.addFilter)
    I.seeElement(this.locators.filterWrapper)
    const articles = await I.grabNumberOfVisibleElements(
      this.locators.articleRows
    )

    I.seeNumbersAreEqual(articles, 3)
    const articleTitles = await I.grabTextFrom(this.locators.titles)

    I.click(this.locators.filterWrapper)
    I.selectOption(this.locators.filterOperator, 'is')
    I.fillField(this.locators.filterValue, articleTitles[1])
    I.click(this.locators.updateFilter)
    const updatedArticles = await I.grabNumberOfVisibleElements(
      this.locators.articleRows
    )

    I.seeNumbersAreEqual(updatedArticles, 1)
    I.click(this.locators.filterClose)
    let newTotal = await I.grabNumberOfVisibleElements(
      this.locators.articleRows
    )

    I.seeNumbersAreEqual(originalArticles, newTotal)
    I.click(this.locators.filterButton)
    I.selectOption(this.locators.filterField, 'Published')
    I.seeElement(this.locators.filterOperator)
    I.click(this.locators.addFilter)
    I.seeElement(this.locators.filterWrapper)
    const publishedNo = await I.grabNumberOfVisibleElements(
      this.locators.articleRows
    )

    I.seeNumbersAreEqual(publishedNo, numberNo)
    I.click(this.locators.filterWrapper)
    I.selectOption(this.locators.filterValueSelect, 'Yes')
    I.click(this.locators.updateFilter)
    const publishedYes = await I.grabNumberOfVisibleElements(
      this.locators.articleRows
    )

    I.seeNumbersAreEqual(publishedYes, numberYes)
    I.click(this.locators.filterClose)
    newTotal = await I.grabNumberOfVisibleElements(this.locators.articleRows)
    I.seeNumbersAreEqual(originalArticles, newTotal)
    I.click(this.locators.filterButton)
    I.selectOption(this.locators.filterField, 'Date & Time')
    I.seeElement(this.locators.filterOperator)
    I.selectOption(this.locators.filterOperator, 'is after')
    I.click(this.locators.dateTimeValue)
    I.fillField(this.locators.dateTimeValue, pastDateFilter)
    I.click(this.locators.filterOperator)
    I.click(this.locators.addFilter)
    I.seeElement(this.locators.filterWrapper)
    const datesAfter = await I.grabNumberOfVisibleElements(
      this.locators.articleRows
    )

    I.seeNumbersAreEqual(datesAfter, dateFilter)
  },

  async deleteArticle() {
    I.amOnPage('/articles')
    I.waitForVisible(this.locators.articleTitleHeading)
    I.waitForElement(this.locators.footer)
    I.seeElement(this.locators.createNewButton)
    const total = await I.grabTextFrom(this.locators.totalArticles)

    const deleteArticles = await I.grabTextFrom(this.locators.numEditArticles)

    I.click(
      locate('td')
        .before('//td[.="' + deleteArticles[0].trim() + '"]')
        .as('First Article to Delete')
    )
    I.click(this.locators.selectDelete)
    I.click(this.locators.applyButton)
    I.waitForText('The document has been deleted', 2)
    I.dontSee(deleteArticles[0])
    const newTotal = await I.grabTextFrom(this.locators.totalArticles)

    I.seeTotalHasDecreased(newTotal, total)
    I.click(
      locate('span[class*="FieldString__with-ellipsis"]')
        .withText(deleteArticles[1].trim())
        .as('Second Article to Delete')
    )
    I.click(this.locators.delArticleButton)
    I.waitForText('Are you sure you want to delete this document?')
    I.pressKey('Enter')
    I.waitForText('The document has been deleted', 2)
    I.dontSee(deleteArticles[1])
    const newestTotal = await I.grabTextFrom(this.locators.totalArticles)

    I.seeTotalHasDecreased(newestTotal, newTotal)
  },

  async newSignOut() {
    I.click(this.locators.createNewButton)
    I.waitForFunction(() => document.readyState === 'complete')
    I.seeInCurrentUrl('/articles/new')
  },

  async editSignOut() {
    const link = await I.grabAttributeFrom(this.locators.signOutArticle, 'href')
    const start = link.indexOf('/articles/')
    const id = link.slice(start)

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
    I.amOnPage('/articles/new')
    I.waitForFunction(() => document.readyState === 'complete')
    I.seeInCurrentUrl('/articles/new')
    I.waitForVisible(this.locators.titleField)
    I.fillField(this.locators.titleField, 'Rich Text')
    I.scrollTo(this.locators.selectCategory)

    // Bold
    I.fillField(this.locators.bodyField, 'Bold Text')
    I.pressKey('ArrowLeft')
    I.pressKey('ArrowLeft')
    I.pressKey('ArrowLeft')
    I.pressKey('ArrowLeft')
    I.pressKey('ArrowLeft')
    I.pressKey(['Shift', 'Home', 'Shift'])
    I.emulateCommandButtonPressBold()
    I.appendField(this.locators.bodyField, '  ')
    I.pressKey('Enter')

    // Italic
    I.fillField(this.locators.bodyField, 'Italic Text')
    I.pressKey('ArrowLeft')
    I.pressKey('ArrowLeft')
    I.pressKey('ArrowLeft')
    I.pressKey('ArrowLeft')
    I.pressKey('ArrowLeft')
    I.pressKey(['Shift', 'Home', 'Shift'])
    I.emulateCommandButtonPressItalic()
    I.appendField(this.locators.bodyField, '  ')
    I.pressKey('Enter')

    // H1
    I.click(this.locators.h1Button)
    I.fillField(this.locators.bodyField, 'Header 1')
    I.pressKey('Enter')

    // H2
    I.click(this.locators.h2Button)
    I.fillField(this.locators.bodyField, 'Header 2')
    I.pressKey('Enter')

    // H3
    I.click(this.locators.h3Button)
    I.fillField(this.locators.bodyField, 'Header 3')
    I.pressKey('Enter')

    // Blockquote
    I.fillField(this.locators.bodyField, 'Some text')
    I.pressKey('Enter')
    I.fillField(this.locators.bodyField, 'Blockquote')
    I.click(this.locators.quoteButton)
    I.pressKey('Enter')
    I.click(this.locators.quoteButton)

    // Link
    I.fillField(this.locators.bodyField, 'Some more text')
    I.pressKey('Enter')
    I.fillField(this.locators.bodyField, 'Link')
    I.pressKey(['Shift', 'Home', 'Shift'])
    I.click(this.locators.linkButton)
    I.waitForElement(this.locators.linkField)
    I.fillField(this.locators.linkField, 'www.link.com')
    I.pressKey('Enter')
    I.appendField(this.locators.bodyField, '  ')
    I.pressKey('Enter')

    // Ordered List
    I.click(this.locators.orderedListButton)
    I.fillField(this.locators.bodyField, 'Point 1')
    I.pressKey('Enter')
    I.fillField(this.locators.bodyField, 'Point 2')
    I.pressKey('Enter')
    I.click(this.locators.orderedListButton)

    // Unordered List
    I.click(this.locators.unOrderedListButton)
    I.fillField(this.locators.bodyField, 'Bullet 1')
    I.pressKey('Enter')
    I.fillField(this.locators.bodyField, 'Bullet 2')
    I.pressKey('Enter')
    I.click(this.locators.unOrderedListButton)

    // Save
    I.click(this.locators.save)
    I.waitForText('The document has been created', 2)
    I.scrollTo(this.locators.selectCategory)
    I.seeElement(this.locators.boldText)
    I.seeElement(this.locators.italicText)
    I.seeElement(this.locators.h1Text)
    I.seeElement(this.locators.h2Text)
    I.seeElement(this.locators.h3Text)
    I.seeElement(this.locators.quoteText)
    I.seeElement(this.locators.linkText)
    I.seeElement(this.locators.orderedList1)
    I.seeElement(this.locators.orderedList2)
    I.seeElement(this.locators.unorderedList1)
    I.seeElement(this.locators.unorderedList2)

    // (!) TO DO: We need a better way of testing the rich editor. Currently,
    // it works by typing *and* selecting text at the same time, which means
    // that styles are being persisted across paragraphs. Ideally, we'd type
    // and only then select different portions of the text and apply the
    // formats. Until that's done, the Markdown output will be messy and
    // probably not worth testing.
    //    -- eb (07/06/2019)

    // Updated rich editor test to use keyboard shortcuts (CMD+B, CMD+I etc)
    // and to be more realistic in selecting text to highlight.
    //    -- dm (03/07/2019)

    // Text mode and Full Screen
    I.click(this.locators.textButton)
    I.see('**Bold** Text')
    I.see('_Italic_ Text')
    I.see('# Header 1')
    I.see('## Header 2')
    I.see('### Header 3')
    I.see('> Blockquote')
    I.see('(www.link.com)')
    I.see('1. Point 1')
    I.see('2. Point 2')
    I.see('- Bullet 1')
    I.see('- Bullet 2')
    I.click(this.locators.textButton)
    I.click(this.locators.fullScreenButton)
    I.dontSeeElement(this.locators.titleField)
    I.dontSeeElement(this.locators.selectCategory)
    I.click(this.locators.exitFullScreenButton)
    I.seeElement(this.locators.titleField)
    I.seeElement(this.locators.selectCategory)
  },

  async inlineImage() {
    I.amOnPage('/articles/new')
    I.waitForFunction(() => document.readyState === 'complete')
    I.seeInCurrentUrl('/articles/new')
    I.waitForVisible(this.locators.titleField)
    I.fillField(this.locators.titleField, 'Inline Image')

    // Inline Image
    I.appendField(this.locators.bodyField, '')
    I.click(this.locators.imageButton)
    I.click(this.locators.dogImageCheckbox)
    I.click(this.locators.insertButton)
    I.click(this.locators.save)
    I.waitForText('The document has been created', 2)
    // Get today's date for URL
    const year = await moment(new Date()).format('YYYY')
    const month = await moment(new Date()).format('MM')
    const day = await moment(new Date()).format('DD')
    const imageLink = await I.grabAttributeFrom(this.locators.dogImage, 'src')
    const expectedImageLink =
      'http://localhost:3004/media/' +
      year +
      '/' +
      month +
      '/' +
      day +
      '/dog.jpg'

    I.seeStringContains(imageLink, expectedImageLink)
    // markdown view
    I.wait(2)
    I.scrollTo(this.locators.selectCategory)
    I.click(this.locators.textButton)
    I.seeElement(this.locators.markdownText)
    const imageText = await I.grabTextFrom(this.locators.markdownText)

    I.seeStringsAreEqual(imageText, '![](' + expectedImageLink + ')')
  }
}
