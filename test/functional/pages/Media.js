'use strict'

const I = actor()

module.exports = {
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
    mediaSearchField: locate('input[placeholder*="Search"]').as(
      'Media Search Field'
    ),
    docFilterSuggestionsForm: locate(
      'div[class*="DocumentListController__suggestions"]'
    ).as('Filter Suggestions Form'),
    docFilterSuggestionsOptions: locate(
      'span[class*="DocumentListController__suggestion-prefix"]'
    ).as('Filter Suggestions'),
    fileNameContainsFilter: locate(
      'span[class*="DocumentListController__suggestion-prefix"]'
    )
      .withText('Filename contains')
      .as('Filename Contains Filter'),
    saveMenu: locate('button[class*="ButtonWithOptions__sideButton"]').as(
      'Save Menu'
    ),
    saveGoBack: locate('div[class*="ButtonWithOptions__dropdownItem"]')
      .withText('Save & go back')
      .as('Save & Go Back'),
    save: locate('button[class*="ButtonWithOptions__mainButton"]').as(
      'Save Button'
    ),
    totalImages: locate('span strong:nth-child(2)').as(
      'Total Number of Images'
    ),
    checkImage: locate('label[class *= "MediaGridCard__select___"]')
      .first()
      .as('Select Image'),
    applyButton: locate('button')
      .withText('Apply')
      .as('Apply Button'),
    selectDelete: locate('button[class*="delete-button"]').as('Select Delete'),
    deleteButton: locate('button[class*="delete-button"]').as('Delete Button'),
    confirmDeleteButton: locate('button')
      .withText('Yes, delete it')
      .as('Confirm Delete Button'),
    nevermindButton: locate('*')
      .withAttr({
        'data-name': 'cancel-reference-selection-button'
      })
      .as('Back to document'),
    filterButton: locate('button')
      .withAttr({'data-name': 'add-filter-button'})
      .as('Filter Button'),
    filterForm: locate('form[class*="DocumentFilters__tooltip"]').as(
      'Add Filter Form'
    ),
    filterField: locate(
      'div[class*="field-selector"] select[class*="Select"]'
    ).as('Filter Field'),
    filterOperator: locate(
      'div[class*="operator-selector"] select[class*="Select"]'
    ).as('Filter Operator'),
    filterValueString: locate('input[class*="FieldString__filter-input"]').as(
      'Search String Value'
    ),
    filterValueNumber: locate('input[class*="FieldNumber__filter-input"]').as(
      'Search Number Value'
    ),
    applyFilterButton: locate('button[class*="update-filter-button"]').as(
      'Apply Filter Button'
    ),
    updateFilter: locate('button[class*="DocumentFilters__tooltip"]')
      .withText('Update filter')
      .as('Update Filter Button'),
    filterWrapper: locate(
      'span[class*="DocumentListController__filter-field"]'
    ).as('Filtered Detail'),
    filterRemove: locate('button[class*="remove-filter-button"]').as(
      'Filter Remove Button'
    ),
    filterText: locate('div[class*="DocumentListController__filter___"]').as(
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
    I.amOnPage('/media')
    I.waitForFunction(() => document.readyState === 'complete')
    I.waitForElement(this.locators.footer)
    I.seeElement(this.locators.dropArea)
    const images = await I.grabNumberOfVisibleElements(this.locators.images)

    I.seeNumberOfVisibleElements(this.locators.images, images)
    I.seeTotalGreaterThanZero(images)
    I.attachFile(this.locators.fileUpload, 'functional/images/Stone.jpeg')
    I.waitForFunction(() => document.readyState === 'complete')
    const newImages = await I.grabNumberOfVisibleElements(this.locators.images)

    I.seeTotalHasIncreased(newImages, images)
    I.see('Stone.jpeg')
  },

  async selectMedia() {
    I.amOnPage('/media')
    I.waitForFunction(() => document.readyState === 'complete')
    I.waitForElement(this.locators.footer)
    I.seeElement(this.locators.dropArea)
    I.see('Stone.jpeg')
    const stoneLink = await I.grabAttributeFrom(this.locators.stoneURL, 'href')
    const dogLink = await I.grabAttributeFrom(this.locators.dogURL, 'href')
    const girlLink = await I.grabAttributeFrom(this.locators.girlURL, 'href')

    I.click(this.locators.stoneImage)
    I.waitForFunction(() => document.readyState === 'complete')
    I.seeInCurrentUrl(stoneLink)
    I.see('DETAILS')
    I.see('METADATA')
    I.seeElement(this.locators.editImage)
    I.seeElement(this.locators.fileNameField)
    const stoneFileNameText = await I.grabValueFrom(this.locators.fileNameField)

    I.seeElement(this.locators.mimeField)
    const stoneMimeText = await I.grabValueFrom(this.locators.mimeField)

    I.seeElement(this.locators.heightField)
    const stoneHeightText = await I.grabValueFrom(this.locators.heightField)

    I.seeElement(this.locators.widthField)
    const stoneWidthText = await I.grabValueFrom(this.locators.widthField)

    I.seeElement(this.locators.urlField)
    const stoneUrlText = await I.grabValueFrom(this.locators.urlField)

    I.seeStringsAreEqual(stoneFileNameText, 'Stone.jpeg')
    I.seeStringsAreEqual(stoneMimeText, 'image/jpeg')
    I.seeStringsAreEqual(stoneHeightText, '317')
    I.seeStringsAreEqual(stoneWidthText, '214')
    I.seeStringContains(stoneUrlText, 'Stone.jpeg')
    I.click(this.locators.metaDataTab)
    I.see('Alternative text')
    I.fillField(this.locators.altTextField, 'Alt Text')
    I.see('Caption')
    I.fillField(this.locators.captionField, 'Stone Caption')
    I.see('Copyright information')
    I.fillField(this.locators.copyrightField, 'Copyright DADI')
    I.click(this.locators.saveMenu)
    I.click(this.locators.saveGoBack)
    I.waitForText('The document has been updated successfully')
    I.click(this.locators.dogImage)
    I.waitForFunction(() => document.readyState === 'complete')
    I.seeInCurrentUrl(dogLink)
    I.see('DETAILS')
    I.see('METADATA')
    I.seeElement(this.locators.editImage)
    I.seeElement(this.locators.fileNameField)
    const dogFileNameText = await I.grabValueFrom(this.locators.fileNameField)

    I.seeElement(this.locators.mimeField)
    const dogMimeText = await I.grabValueFrom(this.locators.mimeField)

    I.seeElement(this.locators.heightField)
    const dogHeightText = await I.grabValueFrom(this.locators.heightField)

    I.seeElement(this.locators.widthField)
    const dogWidthText = await I.grabValueFrom(this.locators.widthField)

    I.seeElement(this.locators.urlField)
    const dogUrlText = await I.grabValueFrom(this.locators.urlField)

    I.seeStringsAreEqual(dogFileNameText, 'dog.jpg')
    I.seeStringsAreEqual(dogMimeText, 'image/jpeg')
    I.seeStringsAreEqual(dogHeightText, '675')
    I.seeStringsAreEqual(dogWidthText, '1200')
    I.seeStringContains(dogUrlText, 'dog.jpg')
    I.click(this.locators.metaDataTab)
    I.see('Alternative text')
    I.fillField(this.locators.altTextField, 'Dog Biscuit')
    I.see('Caption')
    I.fillField(this.locators.captionField, 'Dog wants biscuit')
    I.see('Copyright information')
    I.fillField(this.locators.copyrightField, 'DADI')
    I.click(this.locators.saveMenu)
    I.click(this.locators.saveGoBack)
    I.waitForText('The document has been updated successfully')
    I.click(this.locators.girlImage)
    I.waitForFunction(() => document.readyState === 'complete')
    I.seeInCurrentUrl(girlLink)
    I.see('DETAILS')
    I.see('METADATA')
    I.seeElement(this.locators.editImage)
    I.seeElement(this.locators.fileNameField)
    const girlFileNameText = await I.grabValueFrom(this.locators.fileNameField)

    I.seeElement(this.locators.mimeField)
    const girlMimeText = await I.grabValueFrom(this.locators.mimeField)

    I.seeElement(this.locators.heightField)
    const girlHeightText = await I.grabValueFrom(this.locators.heightField)

    I.seeElement(this.locators.widthField)
    const girlWidthText = await I.grabValueFrom(this.locators.widthField)

    I.seeElement(this.locators.urlField)
    const girlUrlText = await I.grabValueFrom(this.locators.urlField)

    I.seeStringsAreEqual(girlFileNameText, 'girl.png')
    I.seeStringsAreEqual(girlMimeText, 'image/png')
    I.seeStringsAreEqual(girlHeightText, '2400')
    I.seeStringsAreEqual(girlWidthText, '3840')
    I.seeStringContains(girlUrlText, 'girl.png')
    I.click(this.locators.metaDataTab)
    I.see('Alternative text')
    I.fillField(this.locators.altTextField, 'Chinese lady')
    I.see('Caption')
    I.fillField(this.locators.captionField, 'A Chinese lady on a path')
    I.see('Copyright information')
    I.fillField(this.locators.copyrightField, 'X-MEN')
    I.click(this.locators.saveMenu)
    I.click(this.locators.saveGoBack)
    I.waitForText('The document has been updated successfully')
  },

  async filterMedia() {
    I.amOnPage('/media')
    I.waitForFunction(() => document.readyState === 'complete')
    I.waitForElement(this.locators.footer)
    I.seeElement(this.locators.dropArea)
    const mediaImages = await I.grabNumberOfVisibleElements(
      this.locators.images
    )

    I.seeNumberOfVisibleElements(this.locators.images, mediaImages)
    I.seeTotalGreaterThanZero(mediaImages)
    // Text Search Box
    I.fillField(this.locators.mediaSearchField, 'gi')
    I.seeElement(this.locators.docFilterSuggestionsForm)
    const filterOptions = await I.grabNumberOfVisibleElements(
      this.locators.docFilterSuggestionsOptions
    )

    I.seeNumberOfVisibleElements(
      this.locators.docFilterSuggestionsOptions,
      filterOptions
    )
    I.click(this.locators.fileNameContainsFilter)
    const imagesFiltered = await I.grabNumberOfVisibleElements(
      this.locators.images
    )

    I.seeNumberOfVisibleElements(this.locators.images, imagesFiltered)
    I.seeElement(this.locators.filterWrapper)
    const containsFilterValue = await I.grabTextFrom(this.locators.filterText)

    I.seeStringsAreEqual(containsFilterValue, "Filename\ncontains\n'gi'")
    I.click(this.locators.filterWrapper)
    const filenameValue = await I.grabValueFrom(this.locators.filterValueString)

    I.seeStringsAreEqual(filenameValue, 'gi')
    I.click(this.locators.filterRemove)
    const mediaImagesReset = await I.grabNumberOfVisibleElements(
      this.locators.images
    )

    I.seeNumberOfVisibleElements(this.locators.images, mediaImagesReset)
    // Number value retained
    I.click(this.locators.filterButton)
    I.selectOption(this.locators.filterField, 'Height')
    I.selectOption(this.locators.filterOperator, 'is less than or equal to')
    I.fillField(this.locators.filterValueNumber, '675')
    I.click(this.locators.applyFilterButton)
    const heightFiltered = await I.grabNumberOfVisibleElements(
      this.locators.images
    )

    I.seeNumberOfVisibleElements(this.locators.images, heightFiltered)
    I.seeElement(this.locators.filterWrapper)
    const numberFilterValue = await I.grabTextFrom(this.locators.filterText)

    I.seeStringsAreEqual(
      numberFilterValue,
      "Height\nis less than or equal to\n'675'"
    )
    I.click(this.locators.filterWrapper)
    const heightValue = await I.grabValueFrom(this.locators.filterValueNumber)

    I.seeNumbersAreEqual(heightValue, '675')
    I.click(this.locators.filterRemove)
    // Filter search summary is correct and case-sensitive
    I.click(this.locators.filterButton)
    I.selectOption(this.locators.filterField, 'Alternative text')
    I.selectOption(this.locators.filterOperator, 'contains')
    I.fillField(this.locators.filterValueString, 'Dog')
    I.click(this.locators.applyFilterButton)
    const altTextFilter = await I.grabNumberOfVisibleElements(
      this.locators.images
    )

    I.seeNumberOfVisibleElements(this.locators.images, altTextFilter)
    I.seeElement(this.locators.filterWrapper)
    const altTextFilterValue = await I.grabTextFrom(this.locators.filterText)

    I.seeStringsAreEqual(
      altTextFilterValue,
      "Alternative text\ncontains\n'Dog'"
    )
    I.click(this.locators.filterWrapper)
    I.selectOption(this.locators.filterField, 'Caption')
    I.fillField(this.locators.filterValueString, 'Dog')
    I.click(this.locators.applyFilterButton)
    const captionFilterValue = await I.grabTextFrom(this.locators.filterText)

    I.seeStringsAreEqual(captionFilterValue, "Caption\ncontains\n'Dog'")
    const captionFilter = await I.grabNumberOfVisibleElements(
      this.locators.images
    )

    I.seeNumberOfVisibleElements(this.locators.images, captionFilter)
  },

  async deleteMedia() {
    I.amOnPage('/media')
    I.waitForFunction(() => document.readyState === 'complete')
    I.waitForElement(this.locators.footer)
    I.seeElement(this.locators.dropArea)
    const total = await I.grabTextFrom(this.locators.totalImages)

    I.see('Stone.jpeg')
    I.click(this.locators.checkImage)
    I.click(this.locators.deleteButton)
    I.waitForText('Are you sure you want to delete the selected document?')
    I.click(this.locators.confirmDeleteButton)
    I.waitForText('The document has been deleted')
    I.dontSee('Stone.jpeg')
    const newTotal = await I.grabTextFrom(this.locators.totalImages)

    I.seeTotalHasDecreased(newTotal, total)
    const dogLink = await I.grabAttributeFrom(this.locators.dogURL, 'href')

    I.click(this.locators.dogImage)
    I.waitForFunction(() => document.readyState === 'complete')
    I.seeInCurrentUrl(dogLink)
    I.see('DETAILS')
    I.see('METADATA')
    I.seeElement(this.locators.editImage)
    I.click(this.locators.editDeleteButton)
    I.waitForText('Are you sure you want to delete this document?')
    I.pressKey('Enter')
    I.waitForText('The document has been deleted')
    I.see('girl.png')
    I.dontSee('dog.jpg')
  },

  async insertMedia(file) {
    await I.createMedia(file)
  },

  async deleteAllMedia(fileName) {
    await I.deleteAllMedia(fileName)
  }
}
