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
    footer: locate('.//footer').as('Article Page Footer'),
    images: locate('[class *= "MediaGridCard__wrapper___"]').as(
      'Number of Images'
    ),
    dropArea: locate('[class *= "DropArea__droparea"]').as('Drop File Area'),
    fileUpload: locate('input[class *= "FileUpload__file"]').as('File Upload'),
    firstImage: locate('a[class *= "MediaGridCard__image-holder___"]')
      .first()
      .as('First Image'),
    stoneImage: locate('img[src*="Stone"]').as('Stone Image'),
    dogImage: locate('img[src*="dog"]').as('Dog Image'),
    girlImage: locate('img[src*="girl"]').as('Girl Image'),
    editImage: locate('img[class *= "MediaEditor__image-preview___"]').as(
      'Image Preview'
    ),
    openNewWindow: locate('a')
      .withText('Open in new window')
      .as('Open In New Window Link'),
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
    saveButton: locate('button')
      .withText('Save')
      .as('Save Button'),
    totalImages: locate('.//strong[2]').as('Total Number of Images'),
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
    nevermindButton: locate('a')
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
    )
  },

  async addMedia() {
    await I.amOnPage('/media')
    await I.waitForFunction(() => document.readyState === 'complete')
    await I.waitForText('Media Library')
    await I.waitForElement(this.locators.footer)
    await I.seeElement(this.locators.dropArea)
    I.wait(2)
    let images = await I.grabNumberOfVisibleElements(this.locators.images)
    await I.seeNumberOfVisibleElements(this.locators.images, images)
    await I.seeTotalGreaterThanZero(images)
    await I.attachFile(
      this.locators.fileUpload,
      'test/functional/images/Stone.jpeg'
    )
    await I.waitForFunction(() => document.readyState === 'complete')
    I.wait(2)
    let newImages = await I.grabNumberOfVisibleElements(this.locators.images)
    I.seeTotalHasIncreased(newImages, images)
    await I.see('Stone.jpeg')
  },

  async selectMedia() {
    await I.amOnPage('/media')
    await I.waitForFunction(() => document.readyState === 'complete')
    await I.waitForText('Media Library')
    await I.waitForElement(this.locators.footer)
    await I.seeElement(this.locators.dropArea)
    I.wait(2)
    await I.see('Stone.jpeg')
    let link = await I.grabAttributeFrom(this.locators.firstImage, 'href')
    await I.click(this.locators.stoneImage)
    await I.waitForFunction(() => document.readyState === 'complete')
    await I.seeInCurrentUrl(link[0])
    await I.see('Preview')
    await I.seeElement(this.locators.editImage)
    await I.see('MIME type')
    await I.see('File size')
    await I.see('File path')
    await I.see('Public URL')
    await I.seeElement(this.locators.openNewWindow)
    await I.see('Width')
    await I.see('Height')
    await I.see('Caption')
    await I.fillField(this.locators.captionField, 'Stone Caption')
    await I.see('Alt text')
    await I.fillField(this.locators.altTextField, 'Alt Text')
    await I.see('Copyright Information')
    await I.fillField(this.locators.copyrightField, 'Copyright DADI')
    I.click(this.locators.saveButton)
    I.waitForText('The document has been updated')
    I.click(this.locators.mediaLibraryLink)
    await I.click(this.locators.dogImage)
    await I.waitForFunction(() => document.readyState === 'complete')
    await I.seeInCurrentUrl(link[1])
    await I.see('Preview')
    await I.seeElement(this.locators.editImage)
    await I.see('MIME type')
    await I.see('File size')
    await I.see('File path')
    await I.see('Public URL')
    await I.seeElement(this.locators.openNewWindow)
    await I.see('Width')
    await I.see('Height')
    await I.see('Caption')
    await I.fillField(this.locators.captionField, 'Dog wants biscuit')
    await I.see('Alt text')
    await I.fillField(this.locators.altTextField, 'Dog Biscuit')
    await I.see('Copyright Information')
    await I.fillField(this.locators.copyrightField, 'DADI')
    I.click(this.locators.saveButton)
    I.waitForText('The document has been updated')
    I.click(this.locators.mediaLibraryLink)
    await I.click(this.locators.girlImage)
    await I.waitForFunction(() => document.readyState === 'complete')
    await I.seeInCurrentUrl(link[2])
    await I.see('Preview')
    await I.seeElement(this.locators.editImage)
    await I.see('MIME type')
    await I.see('File size')
    await I.see('File path')
    await I.see('Public URL')
    await I.seeElement(this.locators.openNewWindow)
    await I.see('Width')
    await I.see('Height')
    await I.see('Caption')
    await I.fillField(this.locators.captionField, 'A Chinese lady on a path')
    await I.see('Alt text')
    await I.fillField(this.locators.altTextField, 'Chinese lady')
    await I.see('Copyright Information')
    await I.fillField(this.locators.copyrightField, 'X-MEN')
    I.click(this.locators.saveButton)
    I.waitForText('The document has been updated')
    I.click(this.locators.mediaLibraryLink)
  },

  async filterMedia() {
    await I.amOnPage('/media')
    await I.waitForFunction(() => document.readyState === 'complete')
    await I.waitForText('Media Library')
    await I.waitForElement(this.locators.footer)
    await I.seeElement(this.locators.dropArea)
    I.wait(2)
    let mediaImages = await I.grabNumberOfVisibleElements(this.locators.images)
    await I.seeNumberOfVisibleElements(this.locators.images, mediaImages)
    await I.seeTotalGreaterThanZero(mediaImages)
    // Text Search Box
    await I.fillField(this.locators.mediaSearchField, 'gi')
    await I.seeElement(this.locators.docFilterSuggestionsForm)
    let filterOptions = await I.grabNumberOfVisibleElements(
      this.locators.docFilterSuggestionsOptions
    )
    await I.seeNumberOfVisibleElements(
      this.locators.docFilterSuggestionsOptions,
      filterOptions
    )
    I.click(this.locators.fileNameContainsFilter)
    let imagesFiltered = await I.grabNumberOfVisibleElements(
      this.locators.images
    )
    await I.seeNumberOfVisibleElements(this.locators.images, imagesFiltered)
    await I.seeElement(this.locators.filterWrapper)
    let containsFilterValue = await I.grabTextFrom(this.locators.filterText)
    I.seeStringsAreEqual(containsFilterValue, "Filenamecontains'gi'\n×")
    I.click(this.locators.filterWrapper)
    let filenameValue = await I.grabValueFrom(this.locators.filterValueString)
    await I.seeStringsAreEqual(filenameValue, 'gi')
    I.click(this.locators.filterClose)
    let mediaImagesReset = await I.grabNumberOfVisibleElements(
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
    let heightFiltered = await I.grabNumberOfVisibleElements(
      this.locators.images
    )
    await I.seeNumberOfVisibleElements(this.locators.images, heightFiltered)
    await I.seeElement(this.locators.filterWrapper)
    let numberFilterValue = await I.grabTextFrom(this.locators.filterText)
    I.seeStringsAreEqual(
      numberFilterValue,
      "Heightis less than or equal to'675'\n×"
    )
    I.click(this.locators.filterWrapper)
    let heightValue = await I.grabValueFrom(this.locators.filterValueNumber)
    await I.seeNumbersAreEqual(heightValue, '675')
    I.click(this.locators.filterClose)
    // Filter search summary is correct and case-sensitive
    I.click(this.locators.filterButton)
    await I.seeElement(this.locators.filterForm)
    I.selectOption(this.locators.filterField, 'Alternative text')
    I.selectOption(this.locators.filterOperator, 'contains')
    I.fillField(this.locators.filterValueString, 'Dog')
    I.click(this.locators.addFilter)
    let altTextFilter = await I.grabNumberOfVisibleElements(
      this.locators.images
    )
    await I.seeNumberOfVisibleElements(this.locators.images, altTextFilter)
    await I.seeElement(this.locators.filterWrapper)
    let altTextFilterValue = await I.grabTextFrom(this.locators.filterText)
    I.seeStringsAreEqual(altTextFilterValue, "Alternative textcontains'Dog'\n×")
    I.click(this.locators.filterWrapper)
    I.selectOption(this.locators.filterField, 'Caption')
    I.fillField(this.locators.filterValueString, 'Dog')
    I.click(this.locators.updateFilter)
    let captionFilterValue = await I.grabTextFrom(this.locators.filterText)
    I.seeStringsAreEqual(captionFilterValue, "Captioncontains'Dog'\n×")
    let captionFilter = await I.grabNumberOfVisibleElements(
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
    I.wait(2)
    let total = await I.grabTextFrom(this.locators.totalImages)
    await I.see('Stone.jpeg')
    I.click(this.locators.checkImage)
    I.selectOption(this.locators.selectDelete, 'Delete (1)')
    I.click(this.locators.applyButton)
    I.waitForText('Are you sure you want to delete the selected document?')
    I.click(this.locators.deleteButton)
    I.waitForText('The media item has been deleted')
    I.wait(2)
    await I.dontSee('Stone.jpeg')
    let newTotal = await I.grabTextFrom(this.locators.totalImages)
    I.seeTotalHasDecreased(newTotal, total)
  },

  async insertMedia(file) {
    await I.createMedia(file)
  },

  async deleteAllMedia(fileName) {
    await I.deleteAllMedia(fileName)
  }
}
