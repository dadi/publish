'use strict'

const {assert, expect} = require('chai')

let I

module.exports = {
  _init() {
    I = require('../stepDefinitions/steps_file.js')()
  },

  // insert your locators and methods here
  locators: {
    mediaLibraryLink: locate('a')
      .withAttr({
        href: '/media'
      })
      .as('Media Library Link'),
    footer: locate('footer').as('Article Page Footer'),
    images: locate('[class *= "MediaGridCard__wrapper___"]').as(
      'Number of Images'
    ),
    dropArea: locate('[class *= "DropArea__droparea"]').as('Drop File Area'),
    fileUpload: locate('input[class *= "FileUpload__file"]').as('File Upload'),
    stoneURL: locate('a[class *= "MediaGridCard__image-holder___"]')
      .withChild('img[src*="Stone"]')
      .as('Stone Image URL'),
    dogURL: locate('a[class *= "MediaGridCard__image-holder___"]')
      .withChild('img[src*="dog"]')
      .as('Dog Image URL'),
    girlURL: locate('a[class *= "MediaGridCard__image-holder___"]')
      .withChild('img[src*="girl"]')
      .as('Girl Image URL'),
    stoneImage: locate('img[src*="Stone"]').as('Stone Image'),
    dogImage: locate('img[src*="dog"]').as('Dog Image'),
    girlImage: locate('img[src*="girl"]').as('Girl Image'),
    metaDataTab: locate('a[class*="SubNavItem"]')
      .withText('Metadata')
      .as('Metadata Tab'),
    editImage: locate('img[class *= "MediaViewer__image___"]').as(
      'Image Preview'
    ),
    captionField: locate('input')
      .withAttr({
        name: 'caption'
      })
      .as('Caption Field'),
    altTextField: locate('input')
      .withAttr({
        name: 'altText'
      })
      .as('Alt Text Field'),
    copyrightField: locate('input')
      .withAttr({
        name: 'copyright'
      })
      .as('Copyright Field'),
    mediaSearchField: locate('input[class*="DocumentFilters__input"]').as(
      'Media Search Field'
    ),
    docFilterSuggestionsForm: locate(
      'div[class*="DocumentFilters__suggestions"]'
    ).as('Filter Suggestions Form'),
    docFilterSuggestionsOptions: locate(
      'span[class*="DocumentFilters__suggestion-prefix"]'
    ).as('Filter Suggestions'),
    fileNameContainsFilter: locate(
      'span[class*="DocumentFilters__suggestion-prefix"]'
    )
      .withText('Filename contains')
      .as('Filename Contains Filter'),
    saveMenu: locate('button[class*="ButtonWithOptions__launcher"]').as(
      'Save Menu'
    ),
    saveGoBack: locate('button')
      .withText('Save and go back')
      .as('Save And Go Back Button'),
    saveButton: locate('button')
      .withText('Save and continue')
      .as('Save And Continue Button'),
    totalImages: locate('span strong:nth-child(2)').as(
      'Total Number of Images'
    ),
    checkImage: locate('input[class *= "MediaGridCard__select___"]')
      .first()
      .as('Select Image'),
    applyButton: locate('button')
      .withText('Apply')
      .as('Apply Button'),
    selectDelete: locate('.//select').as('Select Delete'),
    deleteButton: locate('button')
      .withText('Yes, delete it.')
      .as('Delete Button'),
    nevermindButton: locate('button')
      .withText('Nevermind, back to document')
      .as('Back to document'),
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
    filterValueString: locate('input[class*="FieldString__filter-input"]').as(
      'Search String Value'
    ),
    filterValueNumber: locate('input[class*="FieldNumber__filter-input"]').as(
      'Search Number Value'
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
    filterClose: locate('button[class*="DocumentFilters__filter-close"]').as(
      'Filter Close Button'
    ),
    filterText: locate('div[class*="DocumentFilters__filter___"]').as(
      'Filter Text'
    ),
    fileNameField: locate('input[name*="fileName"]').as('Filename Field'),
    mimeField: locate('input[name*="mimeType"]').as('Mime Type Field'),
    heightField: locate('input[name*="height"]').as('Height Field'),
    widthField: locate('input[name*="width"]').as('Width Field'),
    urlField: locate('input[name*="url"]').as('URL Field'),
    editDeleteButton: locate('button')
      .withText('Delete')
      .as('Delete Button')
  },

  async addMedia() {
    await I.amOnPage('/media')
    await I.waitForFunction(() => document.readyState === 'complete')
    await I.waitForText('Media Library')
    await I.waitForElement(this.locators.footer)
    await I.seeElement(this.locators.dropArea)
    // I.wait(2)
    const images = await I.grabNumberOfVisibleElements(this.locators.images)

    await I.seeNumberOfVisibleElements(this.locators.images, images)
    await I.seeTotalGreaterThanZero(images)
    await I.attachFile(this.locators.fileUpload, 'functional/images/Stone.jpeg')
    await I.waitForFunction(() => document.readyState === 'complete')
    // I.wait(2)
    const newImages = await I.grabNumberOfVisibleElements(this.locators.images)

    I.seeTotalHasIncreased(newImages, images)
    await I.see('Stone.jpeg')
  },

  async selectMedia() {
    await I.amOnPage('/media')
    await I.waitForFunction(() => document.readyState === 'complete')
    await I.waitForText('Media Library')
    await I.waitForElement(this.locators.footer)
    await I.seeElement(this.locators.dropArea)
    // I.wait(2)
    await I.see('Stone.jpeg')
    const stoneLink = await I.grabAttributeFrom(this.locators.stoneURL, 'href')
    const dogLink = await I.grabAttributeFrom(this.locators.dogURL, 'href')
    const girlLink = await I.grabAttributeFrom(this.locators.girlURL, 'href')

    await I.click(this.locators.stoneImage)
    await I.waitForFunction(() => document.readyState === 'complete')
    await I.seeInCurrentUrl(stoneLink)
    await I.see('Details')
    await I.see('Metadata')
    await I.seeElement(this.locators.editImage)
    await I.seeElement(this.locators.fileNameField)
    const stoneFileNameText = await I.grabValueFrom(this.locators.fileNameField)

    await I.seeElement(this.locators.mimeField)
    const stoneMimeText = await I.grabValueFrom(this.locators.mimeField)

    await I.seeElement(this.locators.heightField)
    const stoneHeightText = await I.grabValueFrom(this.locators.heightField)

    await I.seeElement(this.locators.widthField)
    const stoneWidthText = await I.grabValueFrom(this.locators.widthField)

    await I.seeElement(this.locators.urlField)
    const stoneUrlText = await I.grabValueFrom(this.locators.urlField)

    I.seeStringsAreEqual(stoneFileNameText, 'Stone.jpeg')
    I.seeStringsAreEqual(stoneMimeText, 'image/jpeg')
    I.seeStringsAreEqual(stoneHeightText, '317')
    I.seeStringsAreEqual(stoneWidthText, '214')
    I.seeStringContains(stoneUrlText, 'Stone.jpeg')
    await I.click(this.locators.metaDataTab)
    await I.see('Alternative text')
    await I.fillField(this.locators.altTextField, 'Alt Text')
    await I.see('Caption')
    await I.fillField(this.locators.captionField, 'Stone Caption')
    await I.see('Copyright information')
    await I.fillField(this.locators.copyrightField, 'Copyright DADI')
    I.click(this.locators.saveMenu)
    I.click(this.locators.saveGoBack)
    I.waitForText('The document has been updated successfully')
    await I.click(this.locators.dogImage)
    await I.waitForFunction(() => document.readyState === 'complete')
    await I.seeInCurrentUrl(dogLink)
    await I.see('Details')
    await I.see('Metadata')
    await I.seeElement(this.locators.editImage)
    await I.seeElement(this.locators.fileNameField)
    const dogFileNameText = await I.grabValueFrom(this.locators.fileNameField)

    await I.seeElement(this.locators.mimeField)
    const dogMimeText = await I.grabValueFrom(this.locators.mimeField)

    await I.seeElement(this.locators.heightField)
    const dogHeightText = await I.grabValueFrom(this.locators.heightField)

    await I.seeElement(this.locators.widthField)
    const dogWidthText = await I.grabValueFrom(this.locators.widthField)

    await I.seeElement(this.locators.urlField)
    const dogUrlText = await I.grabValueFrom(this.locators.urlField)

    I.seeStringsAreEqual(dogFileNameText, 'dog.jpg')
    I.seeStringsAreEqual(dogMimeText, 'image/jpeg')
    I.seeStringsAreEqual(dogHeightText, '675')
    I.seeStringsAreEqual(dogWidthText, '1200')
    I.seeStringContains(dogUrlText, 'dog.jpg')
    await I.click(this.locators.metaDataTab)
    await I.see('Alternative text')
    await I.fillField(this.locators.altTextField, 'Dog Biscuit')
    await I.see('Caption')
    await I.fillField(this.locators.captionField, 'Dog wants biscuit')
    await I.see('Copyright information')
    await I.fillField(this.locators.copyrightField, 'DADI')
    I.click(this.locators.saveMenu)
    I.click(this.locators.saveGoBack)
    I.waitForText('The document has been updated successfully')
    await I.click(this.locators.girlImage)
    await I.waitForFunction(() => document.readyState === 'complete')
    await I.seeInCurrentUrl(girlLink)
    await I.see('Details')
    await I.see('Metadata')
    await I.seeElement(this.locators.editImage)
    await I.seeElement(this.locators.fileNameField)
    const girlFileNameText = await I.grabValueFrom(this.locators.fileNameField)

    await I.seeElement(this.locators.mimeField)
    const girlMimeText = await I.grabValueFrom(this.locators.mimeField)

    await I.seeElement(this.locators.heightField)
    const girlHeightText = await I.grabValueFrom(this.locators.heightField)

    await I.seeElement(this.locators.widthField)
    const girlWidthText = await I.grabValueFrom(this.locators.widthField)

    await I.seeElement(this.locators.urlField)
    const girlUrlText = await I.grabValueFrom(this.locators.urlField)

    I.seeStringsAreEqual(girlFileNameText, 'girl.png')
    I.seeStringsAreEqual(girlMimeText, 'image/png')
    I.seeStringsAreEqual(girlHeightText, '2400')
    I.seeStringsAreEqual(girlWidthText, '3840')
    I.seeStringContains(girlUrlText, 'girl.png')
    await I.click(this.locators.metaDataTab)
    await I.see('Alternative text')
    await I.fillField(this.locators.altTextField, 'Chinese lady')
    await I.see('Caption')
    await I.fillField(this.locators.captionField, 'A Chinese lady on a path')
    await I.see('Copyright information')
    await I.fillField(this.locators.copyrightField, 'X-MEN')
    I.click(this.locators.saveMenu)
    I.click(this.locators.saveGoBack)
    I.waitForText('The document has been updated successfully')
  },

  async filterMedia() {
    await I.amOnPage('/media')
    await I.waitForFunction(() => document.readyState === 'complete')
    await I.waitForText('Media Library')
    await I.waitForElement(this.locators.footer)
    await I.seeElement(this.locators.dropArea)
    // I.wait(2)
    const mediaImages = await I.grabNumberOfVisibleElements(
      this.locators.images
    )

    await I.seeNumberOfVisibleElements(this.locators.images, mediaImages)
    await I.seeTotalGreaterThanZero(mediaImages)
    // Text Search Box
    await I.fillField(this.locators.mediaSearchField, 'gi')
    await I.seeElement(this.locators.docFilterSuggestionsForm)
    const filterOptions = await I.grabNumberOfVisibleElements(
      this.locators.docFilterSuggestionsOptions
    )

    await I.seeNumberOfVisibleElements(
      this.locators.docFilterSuggestionsOptions,
      filterOptions
    )
    I.click(this.locators.fileNameContainsFilter)
    const imagesFiltered = await I.grabNumberOfVisibleElements(
      this.locators.images
    )

    await I.seeNumberOfVisibleElements(this.locators.images, imagesFiltered)
    await I.seeElement(this.locators.filterWrapper)
    const containsFilterValue = await I.grabTextFrom(this.locators.filterText)

    I.seeStringsAreEqual(containsFilterValue, "Filenamecontains'gi'\n×")
    I.click(this.locators.filterWrapper)
    const filenameValue = await I.grabValueFrom(this.locators.filterValueString)

    await I.seeStringsAreEqual(filenameValue, 'gi')
    I.click(this.locators.filterClose)
    const mediaImagesReset = await I.grabNumberOfVisibleElements(
      this.locators.images
    )

    await I.seeNumberOfVisibleElements(this.locators.images, mediaImagesReset)
    // Number value retained
    I.click(this.locators.filterButton)
    await I.seeElement(this.locators.filterForm)
    I.selectOption(this.locators.filterField, 'Height')
    I.selectOption(this.locators.filterOperator, 'is less than or equal to')
    I.fillField(this.locators.filterValueNumber, '675')
    I.click(this.locators.addFilter)
    const heightFiltered = await I.grabNumberOfVisibleElements(
      this.locators.images
    )

    await I.seeNumberOfVisibleElements(this.locators.images, heightFiltered)
    await I.seeElement(this.locators.filterWrapper)
    const numberFilterValue = await I.grabTextFrom(this.locators.filterText)

    I.seeStringsAreEqual(
      numberFilterValue,
      "Heightis less than or equal to'675'\n×"
    )
    I.click(this.locators.filterWrapper)
    const heightValue = await I.grabValueFrom(this.locators.filterValueNumber)

    await I.seeNumbersAreEqual(heightValue, '675')
    I.click(this.locators.filterClose)
    // Filter search summary is correct and case-sensitive
    I.click(this.locators.filterButton)
    await I.seeElement(this.locators.filterForm)
    I.selectOption(this.locators.filterField, 'Alternative text')
    I.selectOption(this.locators.filterOperator, 'contains')
    I.fillField(this.locators.filterValueString, 'Dog')
    I.click(this.locators.addFilter)
    const altTextFilter = await I.grabNumberOfVisibleElements(
      this.locators.images
    )

    await I.seeNumberOfVisibleElements(this.locators.images, altTextFilter)
    await I.seeElement(this.locators.filterWrapper)
    const altTextFilterValue = await I.grabTextFrom(this.locators.filterText)

    I.seeStringsAreEqual(altTextFilterValue, "Alternative textcontains'Dog'\n×")
    I.click(this.locators.filterWrapper)
    I.selectOption(this.locators.filterField, 'Caption')
    I.fillField(this.locators.filterValueString, 'Dog')
    I.click(this.locators.updateFilter)
    const captionFilterValue = await I.grabTextFrom(this.locators.filterText)

    I.seeStringsAreEqual(captionFilterValue, "Captioncontains'Dog'\n×")
    const captionFilter = await I.grabNumberOfVisibleElements(
      this.locators.images
    )

    await I.seeNumberOfVisibleElements(this.locators.images, captionFilter)
  },

  async deleteMedia() {
    await I.amOnPage('/media')
    await I.waitForFunction(() => document.readyState === 'complete')
    await I.waitForText('Media Library')
    await I.waitForElement(this.locators.footer)
    await I.seeElement(this.locators.dropArea)
    // I.wait(2)
    const total = await I.grabTextFrom(this.locators.totalImages)

    await I.see('Stone.jpeg')
    I.click(this.locators.checkImage)
    I.selectOption(this.locators.selectDelete, 'Delete (1)')
    I.click(this.locators.applyButton)
    I.waitForText('Are you sure you want to delete the selected document?')
    I.click(this.locators.deleteButton)
    I.waitForText('The document has been deleted')
    // I.wait(2)
    await I.dontSee('Stone.jpeg')
    const newTotal = await I.grabTextFrom(this.locators.totalImages)

    I.seeTotalHasDecreased(newTotal, total)
    const dogLink = await I.grabAttributeFrom(this.locators.dogURL, 'href')

    await I.click(this.locators.dogImage)
    await I.waitForFunction(() => document.readyState === 'complete')
    await I.seeInCurrentUrl(dogLink)
    await I.see('Details')
    await I.see('Metadata')
    await I.seeElement(this.locators.editImage)
    await I.click(this.locators.editDeleteButton)
    I.waitForText('Are you sure you want to delete this document?')
    I.pressKey('Enter')
    I.waitForText('The document has been deleted')
    // I.wait(2)
    await I.see('girl.png')
    await I.dontSee('dog.jpg')
  },

  async insertMedia(file) {
    await I.createMedia(file)
  },

  async deleteAllMedia(fileName) {
    await I.deleteAllMedia(fileName)
  }
}
