'use strict'

const {assert, expect} = require('chai')
const moment = require('moment')
const random = require('../helpers/random')

let I

module.exports = {
  _init() {
    I = require('../stepDefinitions/steps_file.js')()
  },

  // insert your locators and methods here
  locators: {
    footer: locate('footer').as('Field Test Page Footer'),
    createNewButton: locate('a')
      .withText('Create new')
      .as('Create New Button'),
    boolReq: locate('div')
      .withAttr({
        'data-field-name': 'boolRequired'
      })
      .find('input')
      .as('A boolean'),
    boolWithComment: locate('div')
      .withAttr({
        'data-field-name': 'boolWithComment'
      })
      .find('input')
      .as('A boolean with a comment'),
    boolReadOnly: locate('div')
      .withAttr({
        'data-field-name': 'boolReadOnly'
      })
      .find('input')
      .as('Read-only boolean'),
    dateReq: locate('div')
      .withAttr({
        'data-field-name': 'dateRequired'
      })
      .find('input')
      .as('A date'),
    dateReqError: locate('div')
      .withAttr({
        'data-field-name': 'dateRequired'
      })
      .find('span[class*="Label__error-message-text"]')
      .withText('This field must be specified')
      .as('Date Required Error Message'),
    dateReadOnly: locate('div')
      .withAttr({
        'data-field-name': 'dateReadOnly'
      })
      .find('input')
      .as('Read-only date'),
    dateFuture: locate('div')
      .withAttr({
        'data-field-name': 'dateFuture'
      })
      .find('input')
      .as('A future date'),
    dateFutureError: locate('div')
      .withAttr({
        'data-field-name': 'dateFuture'
      })
      .find('span[class*="Label__error-message-text"]')
      .withText('This field must be after')
      .as('Future Date Error Message'),
    datePast: locate('div')
      .withAttr({
        'data-field-name': 'datePast'
      })
      .find('input')
      .as('A past date'),
    datePastError: locate('div')
      .withAttr({
        'data-field-name': 'datePast'
      })
      .find('span[class*="Label__error-message-text"]')
      .withText('This field must be before')
      .as('Past Date Error Message'),
    dateAfter: locate('div')
      .withAttr({
        'data-field-name': 'dateAfter'
      })
      .find('input')
      .as('A date after x'),
    dateAfterError: locate('div')
      .withAttr({
        'data-field-name': 'dateAfter'
      })
      .find('span[class*="Label__error-message-text"]')
      .withText('This field must be after Mon Jan 01 2018')
      .as('A Date After Error Message'),
    dateBefore: locate('div')
      .withAttr({
        'data-field-name': 'dateBefore'
      })
      .find('input')
      .as('A date before x'),
    dateBeforeError: locate('div')
      .withAttr({
        'data-field-name': 'dateBefore'
      })
      .find('span[class*="Label__error-message-text"]')
      .withText('This field must be before Mon Jan 01 2018')
      .as('A Date Before Error Message'),
    numberReq: locate('div')
      .withAttr({
        'data-field-name': 'numberRequired'
      })
      .find('input')
      .as('A number'),
    numberReqError: locate('div')
      .withAttr({
        'data-field-name': 'numberRequired'
      })
      .find('span[class*="Label__error-message-text"]')
      .withText('This field must be specified')
      .as('Required Field Error Message'),
    numberNoLabel: locate('div')
      .withAttr({
        'data-field-name': 'numberNoLabel'
      })
      .find('input')
      .as('numberNoLabel'),
    numberGT: locate('div')
      .withAttr({
        'data-field-name': 'numberGreaterThan'
      })
      .find('input')
      .as('Number greaterThan'),
    numberGTError: locate('div')
      .withAttr({
        'data-field-name': 'numberGreaterThan'
      })
      .find('span[class*="Label__error-message-text"]')
      .withText('This field must be greater than 10')
      .as('Number Greater Than 10 Error Message'),
    numberLT: locate('div')
      .withAttr({
        'data-field-name': 'numberLessThan'
      })
      .find('input')
      .as('Number lessThan'),
    numberLTError: locate('div')
      .withAttr({
        'data-field-name': 'numberLessThan'
      })
      .find('span[class*="Label__error-message-text"]')
      .withText('This field must be less than 10')
      .as('Number Less Than 10 Error Message'),
    numberReadOnly: locate('div')
      .withAttr({
        'data-field-name': 'numberReadOnly'
      })
      .find('input')
      .as('A read-only number'),
    numberOdd: locate('div')
      .withAttr({
        'data-field-name': 'numberOdd'
      })
      .find('input')
      .as('Number odd'),
    numberOddError: locate('div')
      .withAttr({
        'data-field-name': 'numberOdd'
      })
      .find('span[class*="Label__error-message-text"]')
      .withText('This field must be odd')
      .as('Number Odd Error Message'),
    numberEven: locate('div')
      .withAttr({
        'data-field-name': 'numberEven'
      })
      .find('input')
      .as('Number even'),
    numberEvenError: locate('div')
      .withAttr({
        'data-field-name': 'numberEven'
      })
      .find('span[class*="Label__error-message-text"]')
      .withText('This field must be even')
      .as('Number Even Error Message'),
    numberInt: locate('div')
      .withAttr({
        'data-field-name': 'numberInteger'
      })
      .find('input')
      .as('Number integer'),
    numberIntError: locate('div')
      .withAttr({
        'data-field-name': 'numberInteger'
      })
      .find('span[class*="Label__error-message-text"]')
      .withText('This field must be integer')
      .as('Number Integer Error Message'),
    numberFloat: locate('div')
      .withAttr({
        'data-field-name': 'numberNotInteger'
      })
      .find('input')
      .as('Number float'),
    numberFloatError: locate('div')
      .withAttr({
        'data-field-name': 'numberNotInteger'
      })
      .find('span[class*="Label__error-message-text"]')
      .withText('This field must not be integer')
      .as('Number Float Error Message'),
    stringReq: locate('div')
      .withAttr({
        'data-field-name': 'stringRequired'
      })
      .find('input')
      .as('Required string'),
    stringReqError: locate('div')
      .withAttr({
        'data-field-name': 'stringRequired'
      })
      .find('span[class*="Label__error-message-text"]')
      .withText('This field must be specified')
      .as('Required Field Error Message'),
    stringReadOnly: locate('div')
      .withAttr({
        'data-field-name': 'stringReadonly'
      })
      .find('input')
      .as('A read-only string'),
    stringMulti: locate('div')
      .withAttr({
        'data-field-name': 'stringMultiLine'
      })
      .find('textarea')
      .withAttr({
        name: 'stringMultiLine'
      })
      .as('Multi-line string'),
    stringHeightContent: locate('div')
      .withAttr({
        'data-field-name': 'stringHeightTypeContent'
      })
      .find('textarea')
      .withAttr({
        name: 'stringHeightTypeContent'
      })
      .as('Multi line string with heightType=content'),
    stringHeightFull: locate('div')
      .withAttr({
        'data-field-name': 'stringHeightTypeFull'
      })
      .find('textarea')
      .withAttr({
        name: 'stringHeightTypeFull'
      })
      .as('Multi line string with heightType=full'),
    stringResizable: locate('div')
      .withAttr({
        'data-field-name': 'stringResizable'
      })
      .find('textarea')
      .withAttr({
        name: 'stringResizable'
      })
      .as('Multi line string with heightType=full and resizable'),
    stringNoLabel: locate('div')
      .withAttr({
        'data-field-name': 'stringNoLabel'
      })
      .find('input')
      .as('stringNoLabel'),
    stringAutoGen: locate('div')
      .withAttr({
        'data-field-name': 'stringAutoGenerated'
      })
      .find('input')
      .as('Auto generated string'),
    stringMinLength: locate('div')
      .withAttr({
        'data-field-name': 'stringMinLength'
      })
      .find('input')
      .as('Must have at least 5 characters'),
    stringMinLengthError: locate('div')
      .withAttr({
        'data-field-name': 'stringMinLength'
      })
      .find('span[class*="Label__error-message-text"]')
      .withText('This field must be at least 5 characters long')
      .as('Minimum Length Error Message'),
    stringMaxLength: locate('div')
      .withAttr({
        'data-field-name': 'stringMaxLength'
      })
      .find('input')
      .as('Must have at most 5 characters'),
    stringMaxLengthError: locate('div')
      .withAttr({
        'data-field-name': 'stringMaxLength'
      })
      .find('span[class*="Label__error-message-text"]')
      .withText('This field must be at most 5 characters long')
      .as('Maximum Length Error Message'),
    stringRegex: locate('div')
      .withAttr({
        'data-field-name': 'stringRegex'
      })
      .find('input')
      .as('Must contain only p and q'),
    stringRegexError: locate('div')
      .withAttr({
        'data-field-name': 'stringRegex'
      })
      .find('span[class*="Label__error-message-text"]')
      .withText('This field is not in the right format')
      .as('Regex Error Message'),
    stringOptions: locate('div')
      .withAttr({
        'data-field-name': 'stringOptions'
      })
      .find('select')
      .withAttr({
        name: 'stringOptions'
      })
      .as('String options'),
    stringOptionsMulti: locate('div')
      .withAttr({
        'data-field-name': 'stringOptionsMultiple'
      })
      .find('input[class*="Checkbox"]')
      .as('String options multiple'),
    stringList: locate('input[name*="stringList"]').as(
      'Multi-Entry String Field'
    ),
    stringListAdd: locate(
      'svg[class*="MuiSvgIcon-root SortableList__icon-add"]'
    ).as('Multi-Entry String Add Button'),
    stringListDrag: locate(
      'svg[class*="MuiSvgIcon-root SortableList__icon-drag"]'
    ).as('Multi-Entry String Drag Element'),
    stringListRemoveButton: locate('div')
      .withAttr({
        'data-field-name': 'stringList'
      })
      .find('button')
      .withText('Remove')
      .as('Multi-Entry String Remove Button'),
    stringListItem: locate('div[class*="SortableList__list-item"]').as(
      'Multi-Entry String Items'
    ),
    stringListEmptyField: locate(
      'svg[class*="MuiSvgIcon-root SortableList__icon-add"]+input[value=""]'
    ).as('Empty Multi-Entry String Item'),
    secondElement: locate('[role="presentation"]').before(
      'input[value="Second String"]'
    ),
    thirdElement: locate('[role="presentation"]').before(
      'input[value="Third String"]'
    ),
    multiEntryStringText: locate('input[value*="String"]').as(
      'Multi-Entry String Text'
    ),
    mutliEntryFirstRemoveButton: locate('input[value*="First"] + button').as(
      'Multi-Entry First String Remove Button'
    ),
    images: locate('[class *= "MediaGridCard__wrapper___"]').as(
      'Number of Images'
    ),
    dropArea: locate('[class *= "DropArea__droparea"]').as('Drop File Area'),
    mediafieldUpload: locate('div')
      .withAttr({
        'data-field-name': 'media'
      })
      .find('input[class*="FileUpload__file"]')
      .as('Media File Drop'),
    mediaJpegUpload: locate('div')
      .withAttr({
        'data-field-name': 'mediaJpeg'
      })
      .find('input[class*="FileUpload__file"]')
      .as('JPEG File Drop'),
    mediaPngUpload: locate('div')
      .withAttr({
        'data-field-name': 'mediaPng'
      })
      .find('input[class*="FileUpload__file"]')
      .as('PNG File Upload'),
    mediaJnPUpload: locate('div')
      .withAttr({
        'data-field-name': 'mediaJpegAndPng'
      })
      .find('input[class*="FileUpload__file"]')
      .as('JPEG or PNG Drop'),
    mediaPdfUpload: locate('div')
      .withAttr({
        'data-field-name': 'mediaPdf'
      })
      .find('input[class*="FileUpload__file"]')
      .as('PDF File Drop'),
    mediaJpegUploadErr: locate('span[class*="Label__error"]')
      .withText('Files must be of type image/jpeg')
      .as('JPEG Upload Error'),
    mediaPngUploadErr: locate('span[class*="Label__error"]')
      .withText('Files must be of type image/png')
      .as('PNG Upload Error'),
    mediaJnPUploadErr: locate('span[class*="Label__error"]')
      .withText('Files must be of type image/jpeg, image/png')
      .as('JPEG or PNG Upload Error'),
    mediaPdfUploadErr: locate('span[class*="Label__error"]')
      .withText('Files must be of type application/pdf')
      .as('PDF Upload Error'),
    firstImage: locate('a[class *= "MediaGridCard__image-holder___"]')
      .first()
      .as('First Image'),
    stoneImage: locate('img[src*="Stone.jpeg"]').as('Stone Image'),
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
    saveMenu: locate('button[class*="ButtonWithOptions__sideButton"]').as(
      'Save Menu'
    ),
    saveGoBack: locate('div[class*="ButtonWithOptions__dropdownItem"]')
      .withText('Save & go back')
      .as('Save & Go Back'),
    save: locate('button[class*="ButtonWithOptions__mainButton"]').as(
      'Save Button'
    ),
    totalImages: locate('.//strong[2]').as('Total Number of Images'),
    stoneJpeg: locate('img[src*="Stone"]').as('JPEG Image 1'),
    watsonJpeg: locate('img[src*="Watson"]').as('JPEG Image 2'),
    dogJpg: locate('img[src*="dog"]').as('JPG Image'),
    girlPng: locate('img[src*="girl"]').as('PNG Image'),
    pdf: locate('div[class*="MediaGridCard__filename"]')
      .withText('DADI_Publish.pdf')
      .as('PDF Document'),
    cancelButton: locate('button[class*="Button__accent--negative"]').as(
      'Cancel Button'
    ),
    boolYes: locate('//tbody/tr[1]/td[2]')
      .withText('Yes')
      .as('A boolean Yes'),
    boolCommentYes: locate('//tbody/tr[1]/td[3]')
      .withText('Yes')
      .as('A boolean with comment Yes'),
    boolNo: locate('span[class*="FieldBoolean__disabled"]')
      .withText('No')
      .as('A read-only boolean No'),
    referenceReq: locate('div')
      .withAttr({
        'data-field-name': 'referenceRequired'
      })
      .find('*')
      .withAttr({
        'data-name': 'select-existing-reference-button'
      })
      .as('Required reference'),
    referenceReadOnly: locate('div')
      .withAttr({
        'data-field-name': 'referenceReadOnly'
      })
      .find('span')
      .withText('None')
      .as('Reference read only'),
    referenceReqError: locate('div')
      .withAttr({
        'data-field-name': 'referenceRequired'
      })
      .find('label[class*="container-error"]')
      .as('Reference required error box'),
    numOfAuthors: locate('td:nth-child(2)').as('Number of Authors'),
    referenceLink: locate('a[class*="FieldReference__value-link"]').as(
      'Added reference'
    ),
    mediaTitle: locate('div')
      .withAttr({
        'data-field-name': 'title'
      })
      .find('input[class*="TextInput"]')
      .as('Media Title'),
    mediaReqExisting: locate('div')
      .withAttr({
        'data-field-name': 'mediaRequired'
      })
      .find('*')
      .withAttr({
        'data-name': 'select-existing-media-button'
      })
      .as('Select existing media Required'),
    mediaReqDevice: locate('div')
      .withAttr({
        'data-field-name': 'mediaRequired'
      })
      .find('*')
      .withAttr({
        'data-name': 'upload-files-button'
      })
      .as('Upload from device Required'),
    mediaReqDrop: locate('div')
      .withAttr({
        'data-field-name': 'mediaRequired'
      })
      .find('div[class*="FieldMedia__upload-options"]')
      .as('Drop files to upload Required'),
    mediaReqError: locate('div')
      .withAttr({
        'data-field-name': 'mediaRequired'
      })
      .find('label[class*="container-error"]')
      .as('Media Required Error'),
    mediaReqPdf: locate('div')
      .withAttr({
        'data-field-name': 'mediaRequired'
      })
      .find('a[title*="DADI_Publish.pdf"]')
      .as('Media Required PDF Attachment'),
    mediaReqJpeg: locate('div')
      .withAttr({
        'data-field-name': 'mediaRequired'
      })
      .find('a[title*="Stone.jpeg"]')
      .as('Media Required JPEG Attachment'),
    mediaReqPng: locate('div')
      .withAttr({
        'data-field-name': 'mediaRequired'
      })
      .find('a[title*="girl.png"]')
      .as('Media Required PNG Attachment'),
    mediaExisting: locate('div')
      .withAttr({
        'data-field-name': 'media'
      })
      .find('*')
      .withAttr({
        'data-name': 'select-existing-media-button'
      })
      .as('Select existing media Media Field'),
    mediaDevice: locate('div')
      .withAttr({
        'data-field-name': 'media'
      })
      .find('*')
      .withAttr({
        'data-name': 'upload-files-button'
      })
      .as('Upload from device Media Field'),
    mediaDrop: locate('div')
      .withAttr({
        'data-field-name': 'media'
      })
      .find('div[class*="FieldMedia__upload-options"]')
      .as('Drop files to upload Media Field'),
    mediaJpegAttach: locate('div')
      .withAttr({
        'data-field-name': 'media'
      })
      .find('a[title*="Watson.jpeg"]')
      .as('Media Field JPEG Attachment'),
    mediaJpegExisting: locate('div')
      .withAttr({
        'data-field-name': 'mediaJpeg'
      })
      .find('*')
      .withAttr({
        'data-name': 'select-existing-media-button'
      })
      .as('Select from existing JPEG Only'),
    mediaJpegDevice: locate('div')
      .withAttr({
        'data-field-name': 'mediaJpeg'
      })
      .find('*')
      .withAttr({
        'data-name': 'upload-files-button'
      })
      .as('Upload from device JPEG Only'),
    mediaJpegDrop: locate('div')
      .withAttr({
        'data-field-name': 'mediaJpeg'
      })
      .find('div[class*="FieldMedia__upload-options"]')
      .as('Drop files to upload JPEG Only'),
    mediaPngExisting: locate('div')
      .withAttr({
        'data-field-name': 'mediaPng'
      })
      .find('*')
      .withAttr({
        'data-name': 'select-existing-media-button'
      })
      .as('Select existing media PNG Only'),
    mediaPngDevice: locate('div')
      .withAttr({
        'data-field-name': 'mediaPng'
      })
      .find('*')
      .withAttr({
        'data-name': 'upload-files-button'
      })
      .as('Upload from device PNG Only'),
    mediaPngDrop: locate('div')
      .withAttr({
        'data-field-name': 'mediaPng'
      })
      .find('div[class*="FieldMedia__upload-options"]')
      .as('Drop files to upload PNG Only'),
    mediaJnPExisting: locate('div')
      .withAttr({
        'data-field-name': 'mediaJpegAndPng'
      })
      .find('*')
      .withAttr({
        'data-name': 'select-existing-media-button'
      })
      .as('Select existing media JPEG or PNG'),
    mediaJnPDevice: locate('div')
      .withAttr({
        'data-field-name': 'mediaJpegAndPng'
      })
      .find('*')
      .withAttr({
        'data-name': 'upload-files-button'
      })
      .as('Upload from device JPEG or PNG'),
    mediaJnPDrop: locate('div')
      .withAttr({
        'data-field-name': 'mediaJpegAndPng'
      })
      .find('div[class*="FieldMedia__upload-options"]')
      .as('Drop files to upload JPEG or PNG'),
    mediaPdfExisting: locate('div')
      .withAttr({
        'data-field-name': 'mediaPdf'
      })
      .find('*')
      .withAttr({
        'data-name': 'select-existing-media-button'
      })
      .as('Select existing media PDF Only'),
    mediaPdfDevice: locate('div')
      .withAttr({
        'data-field-name': 'mediaPdf'
      })
      .find('*')
      .withAttr({
        'data-name': 'upload-files-button'
      })
      .as('Upload from device PDF Only'),
    mediaPdfDrop: locate('div')
      .withAttr({
        'data-field-name': 'mediaPdf'
      })
      .find('div[class*="FieldMedia__upload-options"]')
      .as('Drop files to upload PDF Only'),
    saveSelected: locate('button')
      .withText('Save selection')
      .as('Save Selection Button'),
    mediaJpegAdded: locate('div')
      .withAttr({
        'data-field-name': 'mediaJpeg'
      })
      .find('a[title*="dog.jpg"]')
      .as('JPEG Only Attachment'),
    mediaPngAdded: locate('div')
      .withAttr({
        'data-field-name': 'mediaPng'
      })
      .find('a[title*="girl.png"]')
      .as('PNG Only Attachment'),
    mediaJnPJpegAdded: locate('div')
      .withAttr({
        'data-field-name': 'mediaJpegAndPng'
      })
      .find('a[title*="dog.jpg"]')
      .as('JPEG Attachment'),
    mediaJnPPngAdded: locate('div')
      .withAttr({
        'data-field-name': 'mediaJpegAndPng'
      })
      .find('a[title*="girl.png"]')
      .as('PNG Attachment'),
    mediaPdfAdded: locate('div')
      .withAttr({
        'data-field-name': 'mediaPdf'
      })
      .find('a[title*="DADI_Publish.pdf"]')
      .as('PDF Only Attachment'),
    scrollDown: locate('div[class*="Label__label"]')
      .withText('Media (JPEG and PNG)')
      .as('Down Page'),
    mediaRowInserted: locate('tr[class*="Table__row"]').as(
      'Media Document Row'
    ),
    colourField: locate('div')
      .withAttr({
        'data-field-name': 'color'
      })
      .find('input[class*="TextInput__input"]')
      .as('Insert Colour Field'),
    colourSwatch: locate('div')
      .withAttr({
        'data-field-name': 'color'
      })
      .find('div[class*="FieldColor__swatch"]')
      .as('Colour Swatch'),
    colourContainer: locate('div[class*="ColorPicker__container"]').as(
      'Colour Container'
    ),
    colourPalette: locate('div[class*="ColorPicker__palette"]').as(
      'Colour Palette'
    ),
    colourPicker: locate('div[class*="ColorPicker__picker"]').as(
      'Colour Picker'
    ),
    colourHue: locate('div[class*="ColorPicker__hue"]').as('Colour Hue'),
    colourSlider: locate('div[class*="ColorPicker__slider"]').as(
      'Colour Slider'
    ),
    filterButton: locate('button')
      .withAttr({'data-name': 'add-filter-button'})
      .as('Filter Button'),
    filterButtonDisabled: locate('button[disabled]')
      .withAttr({'data-name': 'add-filter-button'})
      .as('Filter Button Disabled'),
    filterField: locate('div[class*="field-selector"]').as('Filter Field'),
    singleTitle: locate('div')
      .withAttr({
        'data-field-name': 'title'
      })
      .find('input')
      .as('Title Field'),
    singleReference: locate('div')
      .withAttr({
        'data-field-name': 'reference'
      })
      .find('*')
      .withAttr({
        'data-name': 'select-existing-reference-button'
      })
      .as('Reference Field'),
    saveDocument: locate('button[class*="save"]').as('Save Document Button'),
    editReferenceButton: locate('div')
      .withAttr({
        'data-field-name': 'reference'
      })
      .find('*')
      .withAttr({
        'data-name': 'edit-reference-button'
      })
      .as('Edit Reference Button'),
    removeReferenceButton: locate('div')
      .withAttr({
        'data-field-name': 'reference'
      })
      .find('button')
      .as('Remove Reference Button')
  },

  async validateBoolean() {
    await I.amOnPage('/field-testing/field-test-boolean')
    I.wait(2)
    await I.waitForFunction(() => document.readyState === 'complete')
    await I.seeElement(this.locators.createNewButton)
    await I.click(this.locators.createNewButton)
    await I.waitForFunction(() => document.readyState === 'complete')
    await I.seeInCurrentUrl('/field-test-boolean/new')
    await I.seeElement(this.locators.boolReq)
    await I.seeElement(this.locators.boolReadOnly)
    await I.seeElement(this.locators.boolWithComment)
    await I.click(this.locators.boolReq)
    await I.click(this.locators.boolWithComment)
    await I.click(this.locators.saveMenu)
    await I.click(this.locators.saveGoBack)
    await I.waitForText('The document has been created', 3)
    await I.dontSeeInCurrentUrl('/new')
    await I.waitForVisible(this.locators.boolYes)
    await I.seeElement(this.locators.boolCommentYes)
    await I.seeElement(this.locators.boolNo)
  },

  async deleteAllBooleans() {
    await I.deleteFieldTestBooleans()
  },

  async validateDate() {
    await I.amOnPage('/field-testing/field-test-date')
    // I.wait(2)
    await I.waitForFunction(() => document.readyState === 'complete')
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
    await I.click(this.locators.save)
    await I.seeElement(this.locators.dateReqError)
    const formattedDate = moment(new Date()).format('YYYY/MM/DD 09:00')

    await I.fillField(this.locators.dateReq, formattedDate)
    await I.pressKey('Enter')
    let futureDateErr = moment(new Date(), 'YYYY/MM/DD').subtract(
      random(1, 7),
      'days'
    )

    futureDateErr = futureDateErr.format('YYYY/MM/DD 09:00')
    await I.fillField(this.locators.dateFuture, futureDateErr)
    await I.pressKey('Enter')
    await I.click(this.locators.datePast)
    await I.waitForVisible(this.locators.dateFutureError)
    let pastDateErr = moment(new Date(), 'YYYY/MM/DD').add(random(1, 7), 'days')

    pastDateErr = pastDateErr.format('YYYY/MM/DD 09:00')
    await I.fillField(this.locators.datePast, pastDateErr)
    await I.pressKey('Enter')
    await I.click(this.locators.dateAfter)
    await I.waitForVisible(this.locators.datePastError)
    await I.fillField(this.locators.dateAfter, '2017/12/31 09:00')
    await I.pressKey('Enter')
    await I.click(this.locators.dateBefore)
    await I.waitForVisible(this.locators.dateAfterError)
    const dateBefore = moment(new Date()).format('YYYY/MM/DD 09:00')

    await I.fillField(this.locators.dateBefore, dateBefore)
    await I.click(this.locators.dateReq)
    await I.waitForVisible(this.locators.dateBeforeError)
    await I.click(this.locators.save)
    await I.clearField(this.locators.dateFuture)
    let futureDate = moment(new Date(), 'YYYY/MM/DD').add(random(1, 60), 'days')

    futureDate = futureDate.format('YYYY/MM/DD 09:00')
    await I.fillField(this.locators.dateFuture, futureDate)
    await I.click(this.locators.dateReadOnly)
    await I.clearField(this.locators.datePast)
    let pastDate = moment(new Date(), 'YYYY/MM/DD').subtract(
      random(1, 180),
      'days'
    )

    pastDate = pastDate.format('YYYY/MM/DD 09:00')
    await I.fillField(this.locators.datePast, pastDate)
    await I.click(this.locators.dateReadOnly)
    await I.clearField(this.locators.dateAfter)
    await I.fillField(this.locators.dateAfter, '2018/01/02 23:00')
    await I.click(this.locators.dateReadOnly)
    await I.clearField(this.locators.dateBefore)
    await I.fillField(this.locators.dateBefore, '2017/12/31 09:00')
    await I.click(this.locators.dateReadOnly)
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
    // I.wait(2)
    await I.waitForFunction(() => document.readyState === 'complete')
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
    await I.click(this.locators.save)
    await I.waitForVisible(this.locators.numberReqError)
    await I.fillField(this.locators.numberGT, '10')
    await I.waitForVisible(this.locators.numberGTError)
    await I.fillField(this.locators.numberLT, '10')
    await I.waitForVisible(this.locators.numberLTError)
    await I.fillField(this.locators.numberOdd, '2')
    await I.waitForVisible(this.locators.numberOddError)
    await I.fillField(this.locators.numberEven, '1')
    await I.waitForVisible(this.locators.numberEvenError)
    await I.fillField(this.locators.numberInt, '1.01')
    await I.waitForVisible(this.locators.numberIntError)
    await I.fillField(this.locators.numberFloat, '-1')
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
    await I.fillField(this.locators.numberInt, '-21')
    await I.clearField(this.locators.numberFloat)
    await I.fillField(this.locators.numberFloat, '1.0123')
    await I.click(this.locators.saveMenu)
    await I.click(this.locators.saveGoBack)
    await I.waitForText('The document has been created', 3)
    await I.dontSeeInCurrentUrl('/new')
    await I.waitForText('1.0123')
  },

  async deleteAllNumbers() {
    await I.deleteFieldTestNumbers()
  },

  async validateString() {
    await I.amOnPage('/field-testing/field-test-string')
    // I.wait(2)
    await I.waitForFunction(() => document.readyState === 'complete')
    await I.seeElement(this.locators.createNewButton)
    await I.click(this.locators.createNewButton)
    await I.waitForFunction(() => document.readyState === 'complete')
    await I.seeInCurrentUrl('/field-test-string/new')
    await I.seeElement(this.locators.stringReq)
    await I.seeElement(this.locators.stringReadOnly)
    await I.seeElement(this.locators.stringMulti)
    await I.seeElement(this.locators.stringList)
    await I.seeElement(this.locators.stringListAdd)
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
    await I.click(this.locators.save)
    await I.waitForVisible(this.locators.stringReqError)
    await I.fillField(this.locators.stringReq, 'This is a required string')
    // await I.seeAttributesOnElements(this.locators.stringMulti, {
    //   rows: 10
    // })
    await I.fillField(this.locators.stringMulti, 'This is a')
    await I.pressKey('Enter')
    await I.appendField(this.locators.stringMulti, 'multi line string')
    // await I.seeAttributesOnElements(this.locators.stringHeightContent, {
    //   rows: 1
    // })
    // await I.seeAttributesOnElements(this.locators.stringHeightFull, {
    //   rows: 10
    // })
    await I.fillField(this.locators.stringMinLength, 'minl')
    await I.waitForVisible(this.locators.stringMinLengthError)
    await I.fillField(this.locators.stringMaxLength, 'maxlen')
    await I.waitForVisible(this.locators.stringMaxLengthError)
    await I.fillField(this.locators.stringRegex, 'pwq')
    await I.waitForVisible(this.locators.stringRegexError)
    await I.appendField(this.locators.stringMinLength, 'e')
    await I.waitForInvisible(this.locators.stringMinLengthError)
    await I.appendField(this.locators.stringMaxLength, '')
    await I.pressKey('Backspace')
    await I.waitForInvisible(this.locators.stringMaxLengthError)
    await I.clearField(this.locators.stringRegex)
    await I.fillField(this.locators.stringRegex, 'pqpq')
    await I.waitForInvisible(this.locators.stringRegexError)
    await I.selectOption(this.locators.stringOptions, 'Option three')

    await I.scrollTo(this.locators.stringList)
    await I.fillField(this.locators.stringList, 'First String')
    await I.fillField(this.locators.stringListEmptyField, 'Second String')
    await I.pressKey('ArrowDown')
    await I.fillField(this.locators.stringListEmptyField, 'Third String')

    const initialNumDragElements = await I.grabNumberOfVisibleElements(
      this.locators.stringListDrag
    )

    await I.seeNumbersAreEqual(initialNumDragElements, 3)

    const initialNumRemoveButtons = await I.grabNumberOfVisibleElements(
      this.locators.stringListRemoveButton
    )

    await I.seeNumbersAreEqual(initialNumRemoveButtons, 3)

    const initialNumListItems = await I.grabNumberOfVisibleElements(
      this.locators.stringListItem
    )

    await I.seeNumbersAreEqual(initialNumListItems, 4)

    const initialNumStringListAddElements = await I.grabNumberOfVisibleElements(
      this.locators.stringListAdd
    )

    await I.seeNumbersAreEqual(initialNumStringListAddElements, 1)

    const stringValueArray = await I.grabAttributeFrom(
      this.locators.multiEntryStringText,
      'value'
    )

    await I.dragAndDrop(this.locators.thirdElement, this.locators.secondElement)
    const stringValueArrayAfter = await I.grabAttributeFrom(
      this.locators.multiEntryStringText,
      'value'
    )

    await I.seeStringsAreNotEqual(
      stringValueArray.toString(),
      stringValueArrayAfter.toString()
    )

    await I.click(this.locators.mutliEntryFirstRemoveButton)

    const numDragElements = await I.grabNumberOfVisibleElements(
      this.locators.stringListDrag
    )

    await I.seeTotalHasDecreased(numDragElements, initialNumDragElements)

    const numRemoveButtons = await I.grabNumberOfVisibleElements(
      this.locators.stringListRemoveButton
    )

    await I.seeTotalHasDecreased(numRemoveButtons, initialNumRemoveButtons)

    const numListItems = await I.grabNumberOfVisibleElements(
      this.locators.stringListItem
    )

    await I.seeTotalHasDecreased(numListItems, initialNumListItems)

    const numStringListAddElements = await I.grabNumberOfVisibleElements(
      this.locators.stringListAdd
    )

    await I.seeNumbersAreEqual(
      numStringListAddElements,
      initialNumStringListAddElements
    )

    await I.click(this.locators.save)
    await I.waitForText('The document has been created', 2)
    await I.dontSeeInCurrentUrl('/new')
    const updatedSlug = await I.grabValueFrom(this.locators.stringAutoGen)

    await I.seeStringsAreEqual(updatedSlug, 'this-is-a-required-string')
    await I.see('Option three', this.locators.stringOptions)
    await I.click(this.locators.saveMenu)
    await I.click(this.locators.saveGoBack)
    await I.waitForText('This is a required string')
  },

  async deleteAllStrings() {
    await I.deleteFieldTestString()
  },

  async validateReference() {
    await I.amOnPage('/field-testing/field-test-reference')
    // I.wait(2)
    await I.waitForFunction(() => document.readyState === 'complete')
    await I.seeElement(this.locators.createNewButton)
    await I.click(this.locators.createNewButton)
    await I.waitForFunction(() => document.readyState === 'complete')
    await I.seeInCurrentUrl('/field-test-reference/new')
    await I.seeElement(this.locators.referenceReq)
    await I.seeElement(this.locators.referenceReadOnly)
    await I.click(this.locators.referenceReq)
    I.waitForFunction(() => document.readyState === 'complete')
    I.waitForText('Reference')
    await I.click(this.locators.cancelButton)
    await I.seeInCurrentUrl('/field-test-reference/new')
    await I.click(this.locators.save)
    await I.see('An error has occurred. The document could not be created')
    await I.click(this.locators.referenceReq)
    I.waitForFunction(() => document.readyState === 'complete')
    I.waitForText('Reference')
    const numberAuthors = await I.grabNumberOfVisibleElements(
      this.locators.numOfAuthors
    )

    I.seeNumbersAreEqual(numberAuthors, 5)
    const authorsNames = await I.grabTextFrom(this.locators.numOfAuthors)

    I.click(
      locate('td')
        .before(locate('td').withText(authorsNames[2].trim()))
        .as('Selected Author')
    )
    I.click(this.locators.saveSelected)
    I.waitForFunction(() => document.readyState === 'complete')
    I.see(authorsNames[2].trim())
    const link = await I.grabAttributeFrom(
      locate('a').withText(authorsNames[2].trim()),
      'href'
    )

    await I.click(this.locators.saveMenu)
    await I.click(this.locators.saveGoBack)
    await I.waitForText(authorsNames[2].trim())
    const newLink = await I.grabAttributeFrom(
      this.locators.referenceLink,
      'href'
    )

    await I.seeStringsAreEqual(link, newLink)
  },

  async deleteAllReferences() {
    await I.deleteFieldTestReferences()
  },

  async validateMedia() {
    await I.amOnPage('/field-testing/field-test-media')
    await I.waitForFunction(() => document.readyState === 'complete')
    await I.seeElement(this.locators.createNewButton)
    await I.dontSeeElement(this.locators.mediaRowInserted)
    await I.click(this.locators.createNewButton)
    await I.waitForFunction(() => document.readyState === 'complete')
    await I.seeInCurrentUrl('/field-test-media/new')
    await I.seeElement(this.locators.mediaReqExisting)
    await I.seeElement(this.locators.mediaReqDevice)
    await I.seeElement(this.locators.mediaReqDrop)
    await I.seeElement(this.locators.mediaExisting)
    await I.seeElement(this.locators.mediaDevice)
    await I.seeElement(this.locators.mediaDrop)
    await I.seeElement(this.locators.mediaJpegExisting)
    await I.seeElement(this.locators.mediaJpegDevice)
    await I.seeElement(this.locators.mediaJpegDrop)
    await I.seeElement(this.locators.mediaPngExisting)
    await I.seeElement(this.locators.mediaPngDevice)
    await I.seeElement(this.locators.mediaPngDrop)
    await I.seeElement(this.locators.mediaJnPExisting)
    await I.seeElement(this.locators.mediaJnPDevice)
    await I.seeElement(this.locators.mediaJnPDrop)
    await I.seeElement(this.locators.mediaPdfExisting)
    await I.seeElement(this.locators.mediaPdfDevice)
    await I.seeElement(this.locators.mediaPdfDrop)
    await I.fillField(this.locators.mediaTitle, 'Media Document')
    await I.click(this.locators.mediaReqExisting)
    I.waitForFunction(() => document.readyState === 'complete')
    await I.click(this.locators.cancelButton)
    await I.seeInCurrentUrl('/field-test-media/new')
    await I.click(this.locators.save)
    await I.waitForText(
      'An error has occurred. The document could not be created',
      2
    )
    await I.click(this.locators.mediaReqExisting)
    I.waitForFunction(() => document.readyState === 'complete')
    await I.click(this.locators.pdf)
    await I.click(this.locators.stoneJpeg)
    await I.click(this.locators.girlPng)
    await I.click(this.locators.saveSelected)
    I.waitForFunction(() => document.readyState === 'complete')
    await I.seeElement(this.locators.mediaReqPdf)
    await I.seeElement(this.locators.mediaReqJpeg)
    await I.seeElement(this.locators.mediaReqPng)
    await I.click(this.locators.save)
    await I.waitForText('The document has been created', 2)
    await I.dontSeeInCurrentUrl('/new')
    await I.attachFile(
      this.locators.mediafieldUpload,
      'functional/images/Watson.jpeg'
    )
    await I.waitForFunction(() => document.readyState === 'complete')
    await I.seeElement(this.locators.mediaJpegAttach)
    await I.scrollTo(this.locators.mediaPdfDrop)
    await I.attachFile(
      this.locators.mediaJpegUpload,
      'functional/images/girl.png'
    )
    await I.waitForFunction(() => document.readyState === 'complete')
    await I.seeElement(this.locators.mediaJpegUploadErr)
    await I.click(this.locators.mediaJpegExisting)
    I.waitForFunction(() => document.readyState === 'complete')
    await I.see('.jpeg')
    await I.dontSee('.png')
    await I.dontSee('.pdf')
    await I.click(this.locators.dogJpg)
    await I.click(this.locators.saveSelected)
    I.waitForFunction(() => document.readyState === 'complete')
    await I.seeElement(this.locators.mediaJpegAdded)
    await I.scrollTo(this.locators.mediaPngDrop)
    await I.attachFile(
      this.locators.mediaPngUpload,
      'functional/images/dog.jpg'
    )
    await I.waitForFunction(() => document.readyState === 'complete')
    await I.seeElement(this.locators.mediaPngUploadErr)
    await I.click(this.locators.mediaPngExisting)
    I.waitForFunction(() => document.readyState === 'complete')
    await I.see('.png')
    await I.dontSee('.jpeg')
    await I.dontSee('.jpg')
    await I.dontSee('.pdf')
    await I.click(this.locators.girlPng)
    await I.click(this.locators.saveSelected)
    I.waitForFunction(() => document.readyState === 'complete')
    await I.scrollTo(this.locators.mediaJnPDrop)
    await I.seeElement(this.locators.mediaPngAdded)
    await I.scrollTo(this.locators.scrollDown)
    await I.attachFile(
      this.locators.mediaJnPUpload,
      'functional/images/DADI_Publish.pdf'
    )
    await I.waitForFunction(() => document.readyState === 'complete')
    await I.seeElement(this.locators.mediaJnPUploadErr)
    await I.click(this.locators.mediaJnPExisting)
    I.waitForFunction(() => document.readyState === 'complete')
    await I.see('.png')
    await I.see('.jpeg')
    await I.see('.jpg')
    await I.dontSee('.pdf')
    await I.click(this.locators.dogJpg)
    await I.click(this.locators.girlPng)
    await I.click(this.locators.saveSelected)
    I.waitForFunction(() => document.readyState === 'complete')
    await I.scrollTo(this.locators.mediaJnPDevice)
    await I.seeElement(this.locators.mediaJnPJpegAdded)
    await I.seeElement(this.locators.mediaJnPPngAdded)
    await I.scrollTo(this.locators.scrollDown)
    await I.attachFile(
      this.locators.mediaPdfUpload,
      'functional/images/girl.png'
    )
    await I.waitForFunction(() => document.readyState === 'complete')
    await I.seeElement(this.locators.mediaPdfUploadErr)
    await I.click(this.locators.mediaPdfExisting)
    I.waitForFunction(() => document.readyState === 'complete')
    await I.see('.pdf')
    await I.dontSee('.jpeg')
    await I.dontSee('.jpg')
    await I.dontSee('.png')
    await I.click(this.locators.pdf)
    await I.click(this.locators.saveSelected)
    I.waitForFunction(() => document.readyState === 'complete')
    await I.scrollTo(this.locators.mediaJnPDrop)
    await I.seeElement(this.locators.mediaPdfAdded)
    await I.click(this.locators.saveMenu)
    await I.click(this.locators.saveGoBack)
    I.waitForText('The document has been updated')
    await I.seeElement(this.locators.mediaRowInserted)
    await I.see('Media Document')
  },

  async validateMiscField() {
    await I.amOnPage('/field-testing/field-test-other')
    // I.wait(2)
    await I.waitForFunction(() => document.readyState === 'complete')
    await I.seeElement(this.locators.createNewButton)
    await I.click(this.locators.createNewButton)
    await I.waitForFunction(() => document.readyState === 'complete')
    await I.seeInCurrentUrl('/field-test-other/new')
    await I.seeElement(this.locators.colourField)
    await I.seeElement(this.locators.colourSwatch)
    await I.click(this.locators.colourField)
    await I.seeElement(this.locators.colourContainer)
    await I.seeElement(this.locators.colourPalette)
    await I.seeElement(this.locators.colourPicker)
    await I.seeElement(this.locators.colourHue)
    await I.seeElement(this.locators.colourSlider)
    await I.fillField(this.locators.colourField, '4073b1')
    const before = await I.grabValueFrom(this.locators.colourField)

    await I.dragAndDrop(this.locators.colourPicker, this.locators.colourSlider)
    const after = await I.grabValueFrom(this.locators.colourField)

    await I.seeStringsAreNotEqual(after, before)
    await I.click(this.locators.saveMenu)
    await I.click(this.locators.saveGoBack)
    I.waitForText('The document has been created')
    await I.see('094285')
    // check filter only contains string filter field
    await I.click(this.locators.filterButton)
    await I.seeElement(this.locators.filterField)
    const filterValue = await I.grabTextFrom(this.locators.filterField)

    await I.seeStringsAreEqual(filterValue, 'Normal String field')
  },

  async validateNoFilter() {
    await I.amOnPage('/field-testing/no-filterable-fields')
    await I.waitForFunction(() => document.readyState === 'complete')
    await I.seeElement(this.locators.createNewButton)
    await I.click(this.locators.createNewButton)
    await I.waitForFunction(() => document.readyState === 'complete')
    await I.seeInCurrentUrl('/no-filterable-fields/new')
    await I.click(this.locators.saveMenu)
    I.wait(2)
    await I.click(this.locators.saveGoBack)
    I.waitForText('The document has been created')
    await I.seeElement(this.locators.filterButtonDisabled)
  },

  async validateSingleDocument() {
    await I.amOnPage('/test-single-document')
    I.wait(2)
    I.waitForFunction(() => document.readyState === 'complete')
    I.seeElement(this.locators.singleTitle)
    I.seeElement(this.locators.singleReference)
    I.seeElement(this.locators.saveDocument)

    I.fillField(this.locators.singleTitle, 'Single Document')
    I.click(this.locators.singleReference)

    I.waitForFunction(() => document.readyState === 'complete')
    I.dontSeeInCurrentUrl('new')

    I.click(this.locators.cancelButton)

    I.waitForFunction(() => document.readyState === 'complete')
    I.seeInField(this.locators.singleTitle, 'Single Document')
    I.click(this.locators.singleReference)

    I.waitForFunction(() => document.readyState === 'complete')

    I.waitForText('Reference')
    const numberAuthors = await I.grabNumberOfVisibleElements(
      this.locators.numOfAuthors
    )

    I.seeNumbersAreEqual(numberAuthors, 5)
    const authorsNames = await I.grabTextFrom(this.locators.numOfAuthors)

    I.click(locate('//tbody/tr[2]/td[1]').as('Selected Author'))
    I.click(this.locators.saveSelected)
    I.waitForFunction(() => document.readyState === 'complete')
    I.see(authorsNames[1].trim())

    I.seeElement(this.locators.editReferenceButton)
    I.seeElement(this.locators.removeReferenceButton)

    I.click(this.locators.saveDocument)

    I.waitForText('The document has been created', 2)
  }
}
