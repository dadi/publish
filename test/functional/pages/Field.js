'use strict'

const {
  assert,
  expect
} = require('chai')
const moment = require('moment')

let I

module.exports = {

  _init() {
    I = require('../stepDefinitions/steps_file.js')()
  },

  // insert your locators and methods here
  locators: {
    footer: (locate('.//footer').as('Field Test Page Footer')),
    createNewButton: (locate('a').withText('Create new').as('Create New Button')),
    boolReq: (locate('div').withAttr({
      'data-field-name': 'boolRequired'
    }).find('input').withAttr({
      'name': 'boolRequired'
    }).as('A boolean')),
    boolReadOnly: (locate('div').withAttr({
      'data-field-name': 'boolReadOnly'
    }).find('input').withAttr({
      'name': 'boolReadOnly'
    }).as('Read-only boolean')),
    dateReq: (locate('div').withAttr({
      'data-field-name': 'dateRequired'
    }).find('input').withAttr({
      'name': 'dateRequired'
    }).as('A date')),
    dateReqError: (locate('div').withAttr({
      'data-field-name': 'dateRequired'
    }).find('p').withText('This field must be specified').as('Required Field Error Message')),
    dateReadOnly: (locate('div').withAttr({
      'data-field-name': 'dateReadOnly'
    }).find('input').withAttr({
      'name': 'dateReadOnly'
    }).as('Read-only date')),
    dateFuture: (locate('div').withAttr({
      'data-field-name': 'dateFuture'
    }).find('input').withAttr({
      'name': 'dateFuture'
    }).as('A future date')),
    dateFutureError: (locate('div').withAttr({
      'data-field-name': 'dateFuture'
    }).find('p').withText('This field must be after').as('Future Date Error Message')),
    datePast: (locate('div').withAttr({
      'data-field-name': 'datePast'
    }).find('input').withAttr({
      'name': 'datePast'
    }).as('A past date')),
    datePastError: (locate('div').withAttr({
      'data-field-name': 'datePast'
    }).find('p').withText('This field must be before').as('Past Date Error Message')),
    dateAfter: (locate('div').withAttr({
      'data-field-name': 'dateAfter'
    }).find('input').withAttr({
      'name': 'dateAfter'
    }).as('A date after x')),
    dateAfterError: (locate('div').withAttr({
      'data-field-name': 'dateAfter'
    }).find('p').withText('This field must be after Mon Jan 01 2018').as('A Date After Error Message')),
    dateBefore: (locate('div').withAttr({
      'data-field-name': 'dateBefore'
    }).find('input').withAttr({
      'name': 'dateBefore'
    }).as('A date before x')),
    dateBeforeError: (locate('div').withAttr({
      'data-field-name': 'dateBefore'
    }).find('p').withText('This field must be before Mon Jan 01 2018').as('A Date Before Error Message')),
    numberReq: (locate('div').withAttr({
      'data-field-name': 'numberRequired'
    }).find('input').withAttr({
      'name': 'numberRequired'
    }).as('A number')),
    numberReqError: (locate('div').withAttr({
      'data-field-name': 'numberRequired'
    }).find('p').withText('This field must be specified').as('Required Field Error Message')),
    numberNoLabel: (locate('div').withAttr({
      'data-field-name': 'numberNoLabel'
    }).find('input').withAttr({
      'name': 'numberNoLabel'
    }).as('numberNoLabel')),
    numberGT: (locate('div').withAttr({
      'data-field-name': 'numberGreaterThan'
    }).find('input').withAttr({
      'name': 'numberGreaterThan'
    }).as('Number greaterThan')),
    numberGTError: (locate('div').withAttr({
      'data-field-name': 'numberGreaterThan'
    }).find('p').withText('This field must be greater than 10').as('Number Greater Than 10 Error Message')),
    numberLT: (locate('div').withAttr({
      'data-field-name': 'numberLessThan'
    }).find('input').withAttr({
      'name': 'numberLessThan'
    }).as('Number lessThan')),
    numberLTError: (locate('div').withAttr({
      'data-field-name': 'numberLessThan'
    }).find('p').withText('This field must be less than 10').as('Number Less Than 10 Error Message')),
    numberReadOnly: (locate('div').withAttr({
      'data-field-name': 'numberReadOnly'
    }).find('input').withAttr({
      'readonly': 'true'
    }).as('A read-only number')),
    numberOdd: (locate('div').withAttr({
      'data-field-name': 'numberOdd'
    }).find('input').withAttr({
      'name': 'numberOdd'
    }).as('Number odd')),
    numberOddError: (locate('div').withAttr({
      'data-field-name': 'numberOdd'
    }).find('p').withText('This field must be odd').as('Number Odd Error Message')),
    numberEven: (locate('div').withAttr({
      'data-field-name': 'numberEven'
    }).find('input').withAttr({
      'name': 'numberEven'
    }).as('Number even')),
    numberEvenError: (locate('div').withAttr({
      'data-field-name': 'numberEven'
    }).find('p').withText('This field must be even').as('Number Even Error Message')),
    numberInt: (locate('div').withAttr({
      'data-field-name': 'numberInteger'
    }).find('input').withAttr({
      'name': 'numberInteger'
    }).as('Number integer')),
    numberIntError: (locate('div').withAttr({
      'data-field-name': 'numberInteger'
    }).find('p').withText('This field must be integer').as('Number Integer Error Message')),
    numberFloat: (locate('div').withAttr({
      'data-field-name': 'numberNotInteger'
    }).find('input').withAttr({
      'name': 'numberNotInteger'
    }).as('Number float')),
    numberFloatError: (locate('div').withAttr({
      'data-field-name': 'numberNotInteger'
    }).find('p').withText('This field must not be integer').as('Number Float Error Message')),
    stringReq: (locate('div').withAttr({
      'data-field-name': 'stringRequired'
    }).find('input').withAttr({
      'name': 'stringRequired'
    }).as('Required string')),
    stringReqError: (locate('div').withAttr({
      'data-field-name': 'stringRequired'
    }).find('p').withText('This field must be specified').as('Required Field Error Message')),
    stringReadOnly: (locate('div').withAttr({
      'data-field-name': 'stringReadonly'
    }).find('input').withAttr({
      'readonly': 'true'
    }).as('A read-only string')),
    stringMulti: (locate('div').withAttr({
      'data-field-name': 'stringMultiLine'
    }).find('textarea').withAttr({
      'name': 'stringMultiLine'
    }).as('Multi-line string')),
    stringHeightContent: (locate('div').withAttr({
      'data-field-name': 'stringHeightTypeContent'
    }).find('textarea').withAttr({
      'name': 'stringHeightTypeContent'
    }).as('Multi line string with heightType=content')),
    stringHeightFull: (locate('div').withAttr({
      'data-field-name': 'stringHeightTypeFull'
    }).find('textarea').withAttr({
      'name': 'stringHeightTypeFull'
    }).as('Multi line string with heightType=full')),
    stringResizable: (locate('div').withAttr({
      'data-field-name': 'stringResizable'
    }).find('textarea').withAttr({
      'name': 'stringResizable'
    }).as('Multi line string with heightType=full and resizable')),
    stringNoLabel: (locate('div').withAttr({
      'data-field-name': 'stringNoLabel'
    }).find('input').withAttr({
      'name': 'stringNoLabel'
    }).as('stringNoLabel')),
    stringAutoGen: (locate('div').withAttr({
      'data-field-name': 'stringAutoGenerated'
    }).find('input').withAttr({
      'name': 'stringAutoGenerated'
    }).as('Auto generated string')),
    stringMinLength: (locate('div').withAttr({
      'data-field-name': 'stringMinLength'
    }).find('input').withAttr({
      'name': 'stringMinLength'
    }).as('Must have at least 5 characters')),
    stringMaxLength: (locate('div').withAttr({
      'data-field-name': 'stringMaxLength'
    }).find('input').withAttr({
      'name': 'stringMaxLength'
    }).as('Must have at most 5 characters')),
    stringRegex: (locate('div').withAttr({
      'data-field-name': 'stringRegex'
    }).find('input').withAttr({
      'name': 'stringRegex'
    }).as('Must contain only p and q')),
    stringOptions: (locate('div').withAttr({
      'data-field-name': 'stringOptions'
    }).find('select').withAttr({
      'name': 'stringOptions'
    }).as('String options')),
    stringOptionsMulti: (locate('div').withAttr({
      'data-field-name': 'stringOptionsMultiple'
    }).find('select').withAttr({
      'name': 'stringOptionsMultiple'
    }).as('String options multiple')),
    images: (locate('[class *= "MediaGridCard__wrapper___"]').as('Number of Images')),
    dropArea: (locate('[class *= "DropArea__droparea"]').as('Drop File Area')),
    fileUpload: (locate('input[class *= "FileUpload__file"]').as('File Upload')),
    firstImage: (locate('a[class *= "MediaGridCard__image-holder___"]').first().as('First Image')),
    stoneImage: (locate('img[src*="Stone.jpeg"]').as('Stone Image')),
    editImage: (locate('img[class *= "MediaEditor__image-preview___"]').as('Image Preview')),
    openNewWindow: (locate('a').withText('Open in new window').as('Open In New Window Link')),
    captionField: (locate('input').withAttr({
      'name': 'caption'
    }).as('Caption Field')),
    altTextField: (locate('input').withAttr({
      'name': 'altText'
    }).as('Alt Text Field')),
    copyrightField: (locate('input').withAttr({
      'name': 'copyright'
    }).as('Copyright Field')),
    saveMenu: (locate('button[class*="ButtonWithOptions__launcher"]').as('Save Menu')),
    saveGoBack: (locate('button').withText('Save and go back').as('Save And Go Back Button')),
    saveContinue: (locate('button').withText('Save and continue').as('Save And Continue Button')),
    totalImages: (locate('.//strong[2]').as('Total Number of Images')),
    checkImage: (locate('input[class *= "MediaGridCard__select___"]').first().as('Select Image')),
    applyButton: (locate('button').withText('Apply').as('Apply Button')),
    selectDelete: (locate('.//select').as('Select Delete')),
    deleteButton: (locate('button').withText('Yes, delete it.').as('Delete Button')),
    nevermindButton: (locate('a').withText('Nevermind, back to document').as('Back to document')),
    boolYes: (locate('span[class*="FieldBoolean__enabled"]').withText('Yes').as('Yes')),
    boolNo: (locate('span[class*="FieldBoolean__disabled"]').withText('No').as('No'))
  },

  async validateBoolean() {
    await I.amOnPage('/field-testing/field-test-boolean')
    I.wait(3)
    await I.waitForFunction(() => document.readyState === 'complete')
    await I.waitForElement(this.locators.footer)
    await I.seeElement(this.locators.createNewButton)
    await I.click(this.locators.createNewButton)
    await I.waitForFunction(() => document.readyState === 'complete')
    await I.seeInCurrentUrl('/field-test-boolean/new')
    await I.seeElement(this.locators.boolReq)
    await I.seeElement(this.locators.boolReadOnly)
    await I.click(this.locators.boolReq)
    await I.click(this.locators.saveMenu)
    await I.click(this.locators.saveGoBack)
    await I.waitForText('The document has been created', 3)
    await I.dontSeeInCurrentUrl('/new')
    await I.waitForVisible(this.locators.boolYes)
    await I.seeElement(this.locators.boolNo)
  },

  async deleteAllBooleans() {
    await I.deleteFieldTestBooleans()
  },

  async validateDate() {
    await I.amOnPage('/field-testing/field-test-date')
    I.wait(3)
    await I.waitForFunction(() => document.readyState === 'complete')
    await I.waitForElement(this.locators.footer)
    await I.seeElement(this.locators.createNewButton)
    await I.click(this.locators.createNewButton)
    await I.waitForFunction(() => document.readyState === 'complete')
    await I.seeInCurrentUrl('/field-test-date/new')
    await I.seeElement(this.locators.dateReq)
    await I.seeElement(this.locators.dateReadOnly)
    await I.seeElement(this.locators.dateFuture)
    await I.seeElement(this.locators.datePast)
    await I.seeElement(this.locators.dateAfter)
    await I.seeElement(this.locators.dateBefore)
    await I.click(this.locators.saveContinue)
    await I.waitForVisible(this.locators.dateReqError)
    var formattedDate = moment(new Date()).format('YYYY/MM/DD 09:00')
    // console.log(formattedDate)
    await I.click(this.locators.datePast)
    await I.fillField(this.locators.dateReq, formattedDate)
    var futureDateErr = moment(new Date(), 'YYYY/MM/DD').subtract(2, 'day')
    futureDateErr = futureDateErr.format('YYYY/MM/DD 09:00')
    // console.log(futureDateErr)
    await I.fillField(this.locators.dateFuture, futureDateErr)
    await I.click(this.locators.datePast)
    await I.waitForVisible(this.locators.dateFutureError)
    var pastDateErr = moment(new Date(), 'YYYY/MM/DD').add(2, 'day')
    pastDateErr = pastDateErr.format('YYYY/MM/DD 09:00')
    // console.log(pastDateErr)
    await I.fillField(this.locators.datePast, pastDateErr)
    await I.click(this.locators.dateAfter)
    await I.waitForVisible(this.locators.datePastError)
    await I.fillField(this.locators.dateAfter, '2018/01/01 09:00')
    await I.click(this.locators.dateBefore)
    await I.waitForVisible(this.locators.dateAfterError)
    var dateBefore = moment(new Date()).format('YYYY/MM/DD 09:00')
    await I.fillField(this.locators.dateBefore, dateBefore)
    await I.click(this.locators.dateReq)
    await I.waitForVisible(this.locators.dateBeforeError)
    await I.click(this.locators.saveContinue)
    await I.clearField(this.locators.dateFuture)
    var futureDate = moment(new Date(), 'YYYY/MM/DD').add(2, 'day')
    futureDate = futureDate.format('YYYY/MM/DD 09:00')
    // console.log(futureDate)
    await I.fillField(this.locators.dateFuture, futureDate)
    await I.clearField(this.locators.datePast)
    var pastDate = moment(new Date(), 'YYYY/MM/DD').subtract(2, 'day')
    pastDate = pastDate.format('YYYY/MM/DD 09:00')
    // console.log(pastDate)
    await I.fillField(this.locators.datePast, pastDate)
    await I.clearField(this.locators.dateAfter)
    await I.fillField(this.locators.dateAfter, '2018/01/02 09:00')
    await I.clearField(this.locators.dateBefore)
    await I.fillField(this.locators.dateBefore, '2017/12/31 09:00')
    await I.click(this.locators.saveMenu)
    await I.click(this.locators.saveGoBack)
    await I.waitForText('The document has been created', 3)
    await I.dontSeeInCurrentUrl('/new')
    await I.waitForText(formattedDate)
  },

  async deleteAllDates() {
    await I.deleteFieldTestDates()
  },

  async validateNumber() {
    await I.amOnPage('/field-testing/field-test-number')
    I.wait(3)
    await I.waitForFunction(() => document.readyState === 'complete')
    await I.waitForElement(this.locators.footer)
    await I.seeElement(this.locators.createNewButton)
    await I.click(this.locators.createNewButton)
    await I.waitForFunction(() => document.readyState === 'complete')
    await I.seeInCurrentUrl('/field-test-number/new')
    await I.seeElement(this.locators.numberReq)
    await I.seeElement(this.locators.numberNoLabel)
    await I.seeElement(this.locators.numberGT)
    await I.seeElement(this.locators.numberLT)
    await I.seeElement(this.locators.numberReadOnly)
    await I.seeElement(this.locators.numberOdd)
    await I.seeElement(this.locators.numberEven)
    await I.seeElement(this.locators.numberInt)
    await I.seeElement(this.locators.numberFloat)
    await I.click(this.locators.saveContinue)
    await I.waitForVisible(this.locators.numberReqError)
    await I.fillField(this.locators.numberGT, '10')
    await I.waitForVisible(this.locators.numberGTError)
    await I.fillField(this.locators.numberLT, '10')
    await I.waitForVisible(this.locators.numberLTError)
    await I.fillField(this.locators.numberOdd, '2')
    await I.waitForVisible(this.locators.numberOddError)
    await I.fillField(this.locators.numberEven, '1')
    await I.waitForVisible(this.locators.numberEvenError)
    await I.fillField(this.locators.numberInt, '1.1')
    await I.waitForVisible(this.locators.numberIntError)
    await I.fillField(this.locators.numberFloat, '1')
    await I.waitForVisible(this.locators.numberFloatError)
    await I.fillField(this.locators.numberReq, '1')
    await I.appendField(this.locators.numberGT, '')
    await I.pressKey('ArrowUp')
    await I.pressKey('ArrowUp')
    await I.seeInField(this.locators.numberGT, '12')
    await I.appendField(this.locators.numberLT, '')
    await I.pressKey('ArrowDown')
    await I.seeInField(this.locators.numberLT, '9')
    await I.clearField(this.locators.numberOdd)
    await I.fillField(this.locators.numberOdd, '1')
    await I.clearField(this.locators.numberEven)
    await I.fillField(this.locators.numberEven, '2')
    await I.clearField(this.locators.numberInt)
    await I.fillField(this.locators.numberInt, '1')
    await I.clearField(this.locators.numberFloat)
    await I.fillField(this.locators.numberFloat, '1.123')
    await I.click(this.locators.saveMenu)
    await I.click(this.locators.saveGoBack)
    await I.waitForText('The document has been created', 3)
    await I.dontSeeInCurrentUrl('/new')
    await I.waitForText('1.123')
  },

  async deleteAllNumbers() {
    await I.deleteFieldTestNumbers()
  },

  async validateString() {
    await I.amOnPage('/field-testing/field-test-string')
    I.wait(3)
    await I.waitForFunction(() => document.readyState === 'complete')
    await I.waitForElement(this.locators.footer)
    await I.seeElement(this.locators.createNewButton)
    await I.click(this.locators.createNewButton)
    await I.waitForFunction(() => document.readyState === 'complete')
    await I.seeInCurrentUrl('/field-test-string/new')
    await I.seeElement(this.locators.stringReq)
    await I.seeElement(this.locators.stringReadOnly)
    await I.seeElement(this.locators.stringMulti)
    await I.seeElement(this.locators.stringHeightContent)
    await I.seeElement(this.locators.stringHeightFull)
    await I.seeElement(this.locators.stringResizable)
    await I.seeElement(this.locators.stringNoLabel)
    await I.seeElement(this.locators.stringAutoGen)
    await I.seeElement(this.locators.stringMinLength)
    await I.seeElement(this.locators.stringMaxLength)
    await I.seeElement(this.locators.stringRegex)
    await I.seeElement(this.locators.stringOptions)
    await I.seeElement(this.locators.stringOptionsMulti)
    await I.click(this.locators.saveContinue)
    await I.waitForVisible(this.locators.stringReqError)
    // pause()
    // await I.selectOption(this.locators.stringOptionsMulti, ['Option one', 'Option three'])
    // await I.fillField(this.locators.numberGT, '10')
    // await I.waitForVisible(this.locators.numberGTError)
    // await I.fillField(this.locators.numberLT, '10')
    // await I.waitForVisible(this.locators.numberLTError)
    // await I.fillField(this.locators.numberOdd, '2')
    // await I.waitForVisible(this.locators.numberOddError)
    // await I.fillField(this.locators.numberEven, '1')
    // await I.waitForVisible(this.locators.numberEvenError)
    // await I.fillField(this.locators.numberInt, '1.1')
    // await I.waitForVisible(this.locators.numberIntError)
    // await I.fillField(this.locators.numberFloat, '1')
    // await I.waitForVisible(this.locators.numberFloatError)
    // await I.fillField(this.locators.numberReq, '1')
    // await I.appendField(this.locators.numberGT, '')
    // await I.pressKey('ArrowUp')
    // await I.pressKey('ArrowUp')
    // await I.seeInField(this.locators.numberGT, '12')
    // await I.appendField(this.locators.numberLT, '')
    // await I.pressKey('ArrowDown')
    // await I.seeInField(this.locators.numberLT, '9')
    // await I.clearField(this.locators.numberOdd)
    // await I.fillField(this.locators.numberOdd, '1')
    // await I.clearField(this.locators.numberEven)
    // await I.fillField(this.locators.numberEven, '2')
    // await I.clearField(this.locators.numberInt)
    // await I.fillField(this.locators.numberInt, '1')
    // await I.clearField(this.locators.numberFloat)
    // await I.fillField(this.locators.numberFloat, '1.123')
    // await I.click(this.locators.saveMenu)
    // await I.click(this.locators.saveGoBack)
    // await I.waitForText('The document has been created', 3)
    // await I.dontSeeInCurrentUrl('/new')
    // await I.waitForText('1.123')
  }

}
