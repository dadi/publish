'use strict'

const {
  assert,
  expect
} = require('chai')

let I

module.exports = {

  _init() {
    I = require('../stepDefinitions/steps_file.js')()
  },

  // insert your locators and methods here
  locators: {
    footer: (locate('.//footer').as('Article Page Footer')),
    images: (locate('[class *= "MediaGridCard__wrapper___"]').as('Number of Images')),
    dropArea: (locate('[class *= "DropArea__droparea"]').as('Drop File Area')),
    fileUpload: (locate('input[class *= "FileUpload__file"]').as('File Upload')),
    firstImage: (locate('a[class *= "MediaGridCard__image-holder___"]').first().as('First Image')), 
    stoneImage: (locate('img[src*="Stone"]')),
    editImage: (locate('img[class *= "MediaEditor__image-preview___"]').as('Image Preview')),
    openNewWindow: (locate('a').withText('Open in new window').as('Open In New Window Link')),
    captionField: (locate('input').withAttr({ 'name': 'caption' }).as('Caption Field')),
    altTextField: (locate('input').withAttr({
      'name': 'altText'
    }).as('Alt Text Field')),
    copyrightField: (locate('input').withAttr({
      'name': 'copyright'
    }).as('Copyright Field')),
    saveButton: (locate('button').withText('Save').as('Save Button')),
    totalImages: (locate('.//strong[2]').as('Total Number of Images')),
    checkImage: (locate('input[class *= "MediaGridCard__select___"]').first().as('Select Image')),
    applyButton: (locate('button').withText('Apply').as('Apply Button')),
    selectDelete: (locate('.//select').as('Select Delete')),
    deleteButton: (locate('button').withText('Yes, delete it.').as('Delete Button')),
    nevermindButton: (locate('a').withText('Nevermind, back to document').as('Back to document'))
  },

  async addMedia() {
    await I.amOnPage('/media')
    await I.waitForFunction(() => document.readyState === 'complete')
    await I.waitForText('Media Library')
    await I.waitForElement(this.locators.footer)
    pause()
    await I.seeElement(this.locators.dropArea)
    I.wait(3)
    let images = await I.grabNumberOfVisibleElements(this.locators.images)
    // console.log(images)
    await I.seeNumberOfVisibleElements(this.locators.images, images)
    await I.seeTotalGreaterThanZero(images)
    await I.attachFile(this.locators.fileUpload, 'test/functional/images/Stone.jpeg')
    await I.waitForFunction(() => document.readyState === 'complete')
    I.wait(2)
    let newImages = await I.grabNumberOfVisibleElements(this.locators.images)
    // console.log(newImages)
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
    // console.log(link)
    let start = link.indexOf('/media/')
    // console.log(start)
    let id = link.slice(start)
    // console.log(id)
    //   I.click(this.locators.createdArticle)
    await I.click(this.locators.stoneImage)
    await I.waitForFunction(() => document.readyState === 'complete')
    await I.seeInCurrentUrl(id)
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

  },

  async deleteMedia() {
    await I.amOnPage('/media')
    await I.waitForFunction(() => document.readyState === 'complete')
    await I.waitForText('Media Library')
    await I.waitForElement(this.locators.footer)
    await I.seeElement(this.locators.dropArea)
    I.wait(2)
    let total = await I.grabTextFrom(this.locators.totalImages)
    // console.log(total)
    await I.see('Stone.jpeg')
    I.click(this.locators.checkImage)
    I.selectOption(this.locators.selectDelete, 'Delete')
    I.click(this.locators.applyButton)
    I.waitForText('Are you sure you want to delete the selected document?')
    I.click(this.locators.deleteButton)
    I.waitForText('The media item has been deleted')
    I.wait(2)
    await I.dontSee('Stone.jpeg')
    let newTotal = await I.grabTextFrom(this.locators.totalImages)
    // console.log(newTotal)
    I.seeTotalHasDecreased(newTotal, total)
  },

  async insertMedia(file) {
    await I.createMedia(file)
  }

}