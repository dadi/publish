'use strict'

const moment = require('moment')
const random = require('../helpers/random')
const _ = require('lodash')

const I = actor()

module.exports = {
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
    dateYYYYMMDD: locate('div')
      .withAttr({
        'data-field-name': 'dateYYYYMMDD'
      })
      .find('input[class*="TextInput__input"]')
      .as('A date with no time YYYYMMDD'),
    dateDDMMYYYY: locate('div')
      .withAttr({
        'data-field-name': 'dateDDMMYYYY'
      })
      .find('input[class*="TextInput__input"]')
      .as('A date with no time DDMMYYYY'),
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
    stringOptionDisabled: locate('option[disabled]'),
    stringOptionSelected: locate('option[value="three"]'),
    stringOptions: locate('div')
      .withAttr({
        'data-field-name': 'stringOptions'
      })
      .find('select')
      .withAttr({
        name: 'stringOptions'
      })
      .as('String options'),
    optionOne: locate('input[id="one"]').as('Option 1 Checkbox'),
    optionTwo: locate('input[id="two"]').as('Option 2 Checkbox'),
    optionThree: locate('input[id="three"]').as('Option 3 Checkbox'),
    optionFour: locate('input[id="four"]').as('Option 4 Checkbox'),
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
    secondElement: locate('[role="presentation"]')
      .before('input[value="Second String"]')
      .as('Second Element'),
    thirdElement: locate('[role="presentation"]')
      .before('input[value="Third String"]')
      .as('Third Element'),
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
    stoneJpegCheckbox: locate('div[data-filename*="Stone"]')
      .find('input[type="checkbox"]')
      .as('JPEG Image 1 Checkbox'),
    watsonJpegCheckbox: locate('div[data-filename*="Watson"]')
      .find('input[type="checkbox"]')
      .as('JPEG Image 2 Checkbox'),
    dogJpgCheckbox: locate('div[data-filename*="dog"]')
      .find('input[type="checkbox"]')
      .as('JPG Image Checkbox'),
    girlPngCheckbox: locate('div[data-filename*="girl"]')
      .find('input[type="checkbox"]')
      .as('PNG Image Checkbox'),
    pdfCheckbox: locate('div[data-filename="DADI_Publish.pdf"]')
      .find('input[type="checkbox"]')
      .as('PDF Document Checkbox'),
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
    datePickerContainer: locate('div[class*="DateTimePicker__container"]').as(
      'Date Picker'
    ),
    currentDay: locate(
      'button[class*="DateTimePicker__calendar-day-current"]'
    ).as('Current Day'),
    newCurrentDay: locate('button[class*="DateTimePicker__calendar-day"]')
      .withText('05')
      .as('05'),
    hoursLauncherSelector: locate(
      'div[class*="DateTimePicker__time-picker"] > select'
    ).as('Hours Selector'),
    calBackArrow: locate('button[class*="DateTimePicker__page-icon-prev"]').as(
      'Back Arrow'
    ),
    calForwardArrow: locate(
      'button[class*="DateTimePicker__page-icon-next"]'
    ).as('Forward Arrow'),
    currentDate: locate('div[class*="DateTimePicker__head"] > p').as(
      'Current Month and Year'
    ),
    sundayCal: locate('th[class*="DateTimePicker__calendar-head"]')
      .withText('Su')
      .as('Sunday'),
    mondayCal: locate('th[class*="DateTimePicker__calendar-head"]')
      .withText('Mo')
      .as('Monday'),
    tuesdayCal: locate('th[class*="DateTimePicker__calendar-head"]')
      .withText('Tu')
      .as('Tuesday'),
    wednesdayCal: locate('th[class*="DateTimePicker__calendar-head"]')
      .withText('We')
      .as('Wednesday'),
    thursdayCal: locate('th[class*="DateTimePicker__calendar-head"]')
      .withText('Th')
      .as('Thursday'),
    fridayCal: locate('th[class*="DateTimePicker__calendar-head"]')
      .withText('Fr')
      .as('Friday'),
    saturdayCal: locate('th[class*="DateTimePicker__calendar-head"]')
      .withText('Sa')
      .as('Saturday'),
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
    I.amOnPage('/field-testing/field-test-boolean')
    I.wait(2)
    I.waitForFunction(() => document.readyState === 'complete')
    I.seeElement(this.locators.createNewButton)
    I.click(this.locators.createNewButton)
    I.waitForFunction(() => document.readyState === 'complete')
    I.seeInCurrentUrl('/field-test-boolean/new')
    I.seeElement(this.locators.boolReq)
    I.seeElement(this.locators.boolReadOnly)
    I.seeElement(this.locators.boolWithComment)
    I.click(this.locators.boolReq)
    I.click(this.locators.boolWithComment)
    I.click(this.locators.saveMenu)
    I.click(this.locators.saveGoBack)
    I.waitForText('The document has been created', 3)
    I.dontSeeInCurrentUrl('/new')
    I.waitForVisible(this.locators.boolYes)
    I.seeElement(this.locators.boolCommentYes)
    I.seeElement(this.locators.boolNo)
  },

  async deleteAllBooleans() {
    await I.deleteFieldTestBooleans()
  },

  async validateDate() {
    I.amOnPage('/field-testing/field-test-date')
    I.waitForFunction(() => document.readyState === 'complete')
    I.seeElement(this.locators.createNewButton)
    I.click(this.locators.createNewButton)
    I.waitForFunction(() => document.readyState === 'complete')
    I.seeInCurrentUrl('/field-test-date/new')
    I.seeElement(this.locators.dateReq)
    I.seeElement(this.locators.dateReadOnly)
    I.seeElement(this.locators.dateFuture)
    I.seeElement(this.locators.datePast)
    I.seeElement(this.locators.dateAfter)
    I.seeElement(this.locators.dateBefore)
    I.seeElement(this.locators.dateYYYYMMDD)
    I.seeElement(this.locators.dateDDMMYYYY)
    I.click(this.locators.save)
    I.seeElement(this.locators.dateReqError)
    const formattedDate = moment(new Date()).format('YYYY/MM/DD 09:00')

    I.click(this.locators.dateReadOnly)
    I.click(this.locators.dateReq)
    I.seeElement(this.locators.datePickerContainer)
    I.seeElement(this.locators.calBackArrow)
    I.seeElement(this.locators.calForwardArrow)
    I.seeElement(this.locators.sundayCal)
    I.seeElement(this.locators.mondayCal)
    I.seeElement(this.locators.tuesdayCal)
    I.seeElement(this.locators.wednesdayCal)
    I.seeElement(this.locators.thursdayCal)
    I.seeElement(this.locators.fridayCal)
    I.seeElement(this.locators.saturdayCal)
    const momentMonth = moment(new Date())
      .subtract(1, 'months')
      .format('MMMM YYYY')
    const currentMonth = await I.grabTextFrom(this.locators.currentDate)

    I.seeStringsAreEqual(currentMonth, momentMonth)
    I.click(this.locators.currentDay)
    I.click(this.locators.dateReq)
    I.selectOption(this.locators.hoursLauncherSelector, '09:00')
    I.click(this.locators.dateYYYYMMDD)
    I.seeElement(this.locators.datePickerContainer)
    I.seeElement(this.locators.calBackArrow)
    I.seeElement(this.locators.calForwardArrow)
    I.seeElement(this.locators.sundayCal)
    I.seeElement(this.locators.mondayCal)
    I.seeElement(this.locators.tuesdayCal)
    I.seeElement(this.locators.wednesdayCal)
    I.seeElement(this.locators.thursdayCal)
    I.seeElement(this.locators.fridayCal)
    I.seeElement(this.locators.saturdayCal)
    I.dontSeeElement(this.locators.hoursLauncherSelector)
    I.click(this.locators.currentDay)
    const noTimeDate = moment(new Date()).format('DD-MM-YYYY')

    I.click(this.locators.dateDDMMYYYY)
    I.seeElement(this.locators.datePickerContainer)
    I.dontSeeElement(this.locators.hoursLauncherSelector)

    I.fillField(this.locators.dateDDMMYYYY, noTimeDate)
    let futureDateErr = moment(new Date(), 'YYYY/MM/DD').subtract(
      _.random(1, 7),
      'days'
    )

    futureDateErr = futureDateErr.format('YYYY/MM/DD 09:00')
    I.click(this.locators.dateFuture)
    I.fillField(this.locators.dateFuture, futureDateErr)
    I.click(this.locators.dateReadOnly)
    I.click(this.locators.datePast)
    I.waitForVisible(this.locators.dateFutureError)
    let pastDateErr = moment(new Date(), 'YYYY/MM/DD').add(random(1, 7), 'days')

    pastDateErr = pastDateErr.format('YYYY/MM/DD 09:00')
    I.fillField(this.locators.datePast, pastDateErr)
    I.click(this.locators.dateReadOnly)
    I.click(this.locators.dateAfter)
    I.waitForVisible(this.locators.datePastError)
    I.fillField(this.locators.dateAfter, '2017/12/31 09:00')
    I.click(this.locators.dateReadOnly)
    I.click(this.locators.dateBefore)
    I.waitForVisible(this.locators.dateAfterError)
    const dateBefore = moment(new Date()).format('YYYY/MM/DD 09:00')

    I.fillField(this.locators.dateBefore, dateBefore)
    I.click(this.locators.dateReadOnly)
    I.waitForVisible(this.locators.dateBeforeError)
    I.click(this.locators.save)
    I.clearField(this.locators.dateFuture)
    I.seeElement(this.locators.datePickerContainer)
    I.seeElement(this.locators.sundayCal)
    I.seeElement(this.locators.mondayCal)
    I.seeElement(this.locators.tuesdayCal)
    I.seeElement(this.locators.wednesdayCal)
    I.seeElement(this.locators.thursdayCal)
    I.seeElement(this.locators.fridayCal)
    I.seeElement(this.locators.saturdayCal)
    I.click(this.locators.calForwardArrow)
    const newCurrentMonth = await I.grabTextFrom(this.locators.currentDate)
    const newMomentMonth = moment(new Date())
      .add(1, 'months')
      .format('MMMM YYYY')

    I.seeStringsAreEqual(newCurrentMonth, newMomentMonth)
    I.click(this.locators.newCurrentDay)
    I.click(this.locators.dateReadOnly)
    I.click(this.locators.datePast)
    I.clearField(this.locators.datePast)
    let pastDate = moment(new Date(), 'YYYY/MM/DD').subtract(
      random(1, 180),
      'days'
    )

    pastDate = pastDate.format('YYYY/MM/DD 09:00')
    I.fillField(this.locators.datePast, pastDate)
    I.click(this.locators.dateReadOnly)
    I.clearField(this.locators.dateAfter)
    const monthPast = await I.grabTextFrom(this.locators.currentDate)

    I.seeStringsAreEqual(monthPast, 'December 2017')
    I.fillField(this.locators.dateAfter, '2018/01/02 23:00')
    I.click(this.locators.dateReadOnly)
    I.clearField(this.locators.dateBefore)
    I.fillField(this.locators.dateBefore, '2017/12/31 09:00')
    I.click(this.locators.dateReadOnly)
    const correctYYYYMMDD = moment(new Date()).format('YYYY-MM-DD')
    const correctDDMMYYYY = moment(new Date()).format('DD-MM-YYYY')
    const correctedYYYYMMDD = await I.grabValueFrom(this.locators.dateYYYYMMDD)
    const correctedDDMMYYYY = await I.grabValueFrom(this.locators.dateDDMMYYYY)
    const futureDateEntered = await I.grabValueFrom(this.locators.dateFuture)
    const pastDateEntered = await I.grabValueFrom(this.locators.datePast)
    const dateAfterEntered = await I.grabValueFrom(this.locators.dateAfter)
    const dateBeforeEntered = await I.grabValueFrom(this.locators.dateBefore)

    I.seeStringsAreEqual(correctedYYYYMMDD, correctYYYYMMDD)
    I.seeStringsAreEqual(correctedDDMMYYYY, correctDDMMYYYY)

    I.click(this.locators.saveMenu)
    I.click(this.locators.saveGoBack)
    I.waitForText('The document has been created', 3)
    I.dontSeeInCurrentUrl('/new')
    I.waitForText(formattedDate)
    I.waitForText(futureDateEntered)
    I.waitForText(pastDateEntered)
    I.waitForText(dateAfterEntered)
    I.waitForText(dateBeforeEntered)
    I.waitForText(correctedYYYYMMDD)
    I.waitForText(correctedDDMMYYYY)
  },

  async deleteAllDates() {
    await I.deleteFieldTestDates()
  },

  async validateNumber() {
    I.amOnPage('/field-testing/field-test-number')
    // I.wait(2)
    I.waitForFunction(() => document.readyState === 'complete')
    I.seeElement(this.locators.createNewButton)
    I.click(this.locators.createNewButton)
    I.waitForFunction(() => document.readyState === 'complete')
    I.seeInCurrentUrl('/field-test-number/new')
    I.seeElement(this.locators.numberReq)
    I.seeElement(this.locators.numberNoLabel)
    I.seeElement(this.locators.numberGT)
    I.seeElement(this.locators.numberLT)
    I.seeElement(this.locators.numberReadOnly)
    I.seeElement(this.locators.numberOdd)
    I.seeElement(this.locators.numberEven)
    I.seeElement(this.locators.numberInt)
    I.seeElement(this.locators.numberFloat)
    I.click(this.locators.save)
    I.waitForVisible(this.locators.numberReqError)
    I.fillField(this.locators.numberGT, '10')
    I.waitForVisible(this.locators.numberGTError)
    I.fillField(this.locators.numberLT, '10')
    I.waitForVisible(this.locators.numberLTError)
    I.fillField(this.locators.numberOdd, '2')
    I.waitForVisible(this.locators.numberOddError)
    I.fillField(this.locators.numberEven, '1')
    I.waitForVisible(this.locators.numberEvenError)
    I.fillField(this.locators.numberInt, '1.01')
    I.waitForVisible(this.locators.numberIntError)
    I.fillField(this.locators.numberFloat, '-1')
    I.waitForVisible(this.locators.numberFloatError)
    I.fillField(this.locators.numberReq, '1')
    I.appendField(this.locators.numberGT, '')
    I.pressKey('ArrowUp')
    I.pressKey('ArrowUp')
    I.seeInField(this.locators.numberGT, '12')
    I.appendField(this.locators.numberLT, '')
    I.pressKey('ArrowDown')
    I.seeInField(this.locators.numberLT, '9')
    I.clearField(this.locators.numberOdd)
    I.fillField(this.locators.numberOdd, '1')
    I.clearField(this.locators.numberEven)
    I.fillField(this.locators.numberEven, '2')
    I.clearField(this.locators.numberInt)
    I.fillField(this.locators.numberInt, '-21')
    I.clearField(this.locators.numberFloat)
    I.fillField(this.locators.numberFloat, '1.0123')
    I.click(this.locators.saveMenu)
    I.click(this.locators.saveGoBack)
    I.waitForText('The document has been created', 3)
    I.dontSeeInCurrentUrl('/new')
    I.waitForText('1.0123')
  },

  async deleteAllNumbers() {
    await I.deleteFieldTestNumbers()
  },

  async validateString() {
    I.amOnPage('/field-testing/field-test-string')
    // I.wait(2)
    I.waitForFunction(() => document.readyState === 'complete')
    I.seeElement(this.locators.createNewButton)
    I.click(this.locators.createNewButton)
    I.waitForFunction(() => document.readyState === 'complete')
    I.seeInCurrentUrl('/field-test-string/new')
    I.seeElement(this.locators.stringReq)
    I.seeElement(this.locators.stringReadOnly)
    I.seeElement(this.locators.stringMulti)
    I.seeElement(this.locators.stringList)
    I.seeElement(this.locators.stringListAdd)
    I.seeElement(this.locators.stringHeightContent)
    I.seeElement(this.locators.stringHeightFull)
    I.seeElement(this.locators.stringResizable)
    I.seeElement(this.locators.stringNoLabel)
    I.seeElement(this.locators.stringAutoGen)
    I.seeElement(this.locators.stringMinLength)
    I.seeElement(this.locators.stringMaxLength)
    I.seeElement(this.locators.stringRegex)
    I.seeElement(this.locators.stringOptions)
    I.seeElement(this.locators.stringOptionsMulti)
    I.click(this.locators.save)
    I.waitForVisible(this.locators.stringReqError)
    I.fillField(this.locators.stringReq, 'This is a required string')
    // I.seeAttributesOnElements(this.locators.stringMulti, {
    //   rows: 10
    // })
    I.fillField(this.locators.stringMulti, 'This is a')
    I.pressKey('Enter')
    I.appendField(this.locators.stringMulti, 'multi line string')
    // I.seeAttributesOnElements(this.locators.stringHeightContent, {
    //   rows: 1
    // })
    // I.seeAttributesOnElements(this.locators.stringHeightFull, {
    //   rows: 10
    // })
    I.fillField(this.locators.stringMinLength, 'minl')
    I.waitForVisible(this.locators.stringMinLengthError)
    I.fillField(this.locators.stringMaxLength, 'maxlen')
    I.waitForVisible(this.locators.stringMaxLengthError)
    I.fillField(this.locators.stringRegex, 'pwq')
    I.waitForVisible(this.locators.stringRegexError)
    I.appendField(this.locators.stringMinLength, 'e')
    I.waitForInvisible(this.locators.stringMinLengthError)
    I.appendField(this.locators.stringMaxLength, '')
    I.pressKey('Backspace')
    I.waitForInvisible(this.locators.stringMaxLengthError)
    I.clearField(this.locators.stringRegex)
    I.fillField(this.locators.stringRegex, 'pqpq')
    I.waitForInvisible(this.locators.stringRegexError)

    I.scrollTo(this.locators.stringOptions)
    const disabled = await I.grabTextFrom(this.locators.stringOptionDisabled)

    I.seeStringsAreEqual(disabled, 'Please select String options')
    I.selectOption(this.locators.stringOptions, 'Option three')
    const option = await I.grabTextFrom(this.locators.stringOptionSelected)

    I.seeStringsAreEqual(option, 'Option three')

    I.scrollTo(this.locators.stringOptionsMulti)
    I.checkOption(this.locators.optionOne)
    I.checkOption(this.locators.optionFour)
    I.seeCheckboxIsChecked(this.locators.optionOne)
    I.dontSeeCheckboxIsChecked(this.locators.optionTwo)
    I.dontSeeCheckboxIsChecked(this.locators.optionThree)
    I.seeCheckboxIsChecked(this.locators.optionFour)

    I.scrollTo(this.locators.stringList)
    I.fillField(this.locators.stringList, 'First String')
    I.fillField(this.locators.stringListEmptyField, 'Second String')
    I.pressKey('ArrowDown')
    I.fillField(this.locators.stringListEmptyField, 'Third String')

    const initialNumDragElements = await I.grabNumberOfVisibleElements(
      this.locators.stringListDrag
    )

    I.seeNumbersAreEqual(initialNumDragElements, 3)

    const initialNumRemoveButtons = await I.grabNumberOfVisibleElements(
      this.locators.stringListRemoveButton
    )

    I.seeNumbersAreEqual(initialNumRemoveButtons, 3)

    const initialNumListItems = await I.grabNumberOfVisibleElements(
      this.locators.stringListItem
    )

    I.seeNumbersAreEqual(initialNumListItems, 4)

    const initialNumStringListAddElements = await I.grabNumberOfVisibleElements(
      this.locators.stringListAdd
    )

    I.seeNumbersAreEqual(initialNumStringListAddElements, 1)

    const stringValueArray = await I.grabAttributeFrom(
      this.locators.multiEntryStringText,
      'value'
    )

    I.dragAndDrop(this.locators.thirdElement, this.locators.secondElement)
    const stringValueArrayAfter = await I.grabAttributeFrom(
      this.locators.multiEntryStringText,
      'value'
    )

    I.seeStringsAreNotEqual(
      stringValueArray.toString(),
      stringValueArrayAfter.toString()
    )

    I.click(this.locators.mutliEntryFirstRemoveButton)

    const numDragElements = await I.grabNumberOfVisibleElements(
      this.locators.stringListDrag
    )

    I.seeTotalHasDecreased(numDragElements, initialNumDragElements)

    const numRemoveButtons = await I.grabNumberOfVisibleElements(
      this.locators.stringListRemoveButton
    )

    I.seeTotalHasDecreased(numRemoveButtons, initialNumRemoveButtons)

    const numListItems = await I.grabNumberOfVisibleElements(
      this.locators.stringListItem
    )

    I.seeTotalHasDecreased(numListItems, initialNumListItems)

    const numStringListAddElements = await I.grabNumberOfVisibleElements(
      this.locators.stringListAdd
    )

    I.seeNumbersAreEqual(
      numStringListAddElements,
      initialNumStringListAddElements
    )

    I.click(this.locators.save)
    I.waitForText('The document has been created', 2)
    I.dontSeeInCurrentUrl('/new')
    const updatedSlug = await I.grabValueFrom(this.locators.stringAutoGen)

    I.seeStringsAreEqual(updatedSlug, 'this-is-a-required-string')
    I.see('Option three', this.locators.stringOptions)
    I.click(this.locators.saveMenu)
    I.click(this.locators.saveGoBack)
    I.waitForText('This is a required string')
  },

  async deleteAllStrings() {
    await I.deleteFieldTestString()
  },

  async validateReference() {
    I.amOnPage('/field-testing/field-test-reference')
    // I.wait(2)
    I.waitForFunction(() => document.readyState === 'complete')
    I.seeElement(this.locators.createNewButton)
    I.click(this.locators.createNewButton)
    I.waitForFunction(() => document.readyState === 'complete')
    I.seeInCurrentUrl('/field-test-reference/new')
    I.seeElement(this.locators.referenceReq)
    I.seeElement(this.locators.referenceReadOnly)
    I.click(this.locators.referenceReq)
    I.waitForFunction(() => document.readyState === 'complete')
    I.waitForText('Reference')
    I.click(this.locators.cancelButton)
    I.seeInCurrentUrl('/field-test-reference/new')
    I.click(this.locators.save)
    I.see('An error has occurred. The document could not be created')
    I.click(this.locators.referenceReq)
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

    I.click(this.locators.saveMenu)
    I.click(this.locators.saveGoBack)
    I.waitForText(authorsNames[2].trim())
    const newLink = await I.grabAttributeFrom(
      this.locators.referenceLink,
      'href'
    )

    I.seeStringsAreEqual(link, newLink)
  },

  async deleteAllReferences() {
    await I.deleteFieldTestReferences()
  },

  async validateMedia() {
    I.amOnPage('/field-testing/field-test-media')
    I.waitForFunction(() => document.readyState === 'complete')
    I.seeElement(this.locators.createNewButton)
    I.dontSeeElement(this.locators.mediaRowInserted)
    I.click(this.locators.createNewButton)
    I.waitForFunction(() => document.readyState === 'complete')
    I.seeInCurrentUrl('/field-test-media/new')
    I.seeElement(this.locators.mediaReqExisting)
    I.seeElement(this.locators.mediaReqDevice)
    I.seeElement(this.locators.mediaReqDrop)
    I.seeElement(this.locators.mediaExisting)
    I.seeElement(this.locators.mediaDevice)
    I.seeElement(this.locators.mediaDrop)
    I.seeElement(this.locators.mediaJpegExisting)
    I.seeElement(this.locators.mediaJpegDevice)
    I.seeElement(this.locators.mediaJpegDrop)
    I.seeElement(this.locators.mediaPngExisting)
    I.seeElement(this.locators.mediaPngDevice)
    I.seeElement(this.locators.mediaPngDrop)
    I.seeElement(this.locators.mediaJnPExisting)
    I.seeElement(this.locators.mediaJnPDevice)
    I.seeElement(this.locators.mediaJnPDrop)
    I.seeElement(this.locators.mediaPdfExisting)
    I.seeElement(this.locators.mediaPdfDevice)
    I.seeElement(this.locators.mediaPdfDrop)
    I.fillField(this.locators.mediaTitle, 'Media Document')
    I.click(this.locators.mediaReqExisting)
    I.waitForFunction(() => document.readyState === 'complete')
    I.click(this.locators.cancelButton)
    I.seeInCurrentUrl('/field-test-media/new')
    I.click(this.locators.save)
    I.waitForText('An error has occurred. The document could not be created', 2)
    I.click(this.locators.mediaReqExisting)
    I.waitForFunction(() => document.readyState === 'complete')
    I.click(this.locators.pdfCheckbox)
    I.click(this.locators.stoneJpegCheckbox)
    I.click(this.locators.girlPngCheckbox)
    I.click(this.locators.saveSelected)
    I.waitForFunction(() => document.readyState === 'complete')
    I.seeElement(this.locators.mediaReqPdf)
    I.seeElement(this.locators.mediaReqJpeg)
    I.seeElement(this.locators.mediaReqPng)
    I.click(this.locators.save)
    I.waitForText('The document has been created', 2)
    I.dontSeeInCurrentUrl('/new')
    I.attachFile(
      this.locators.mediafieldUpload,
      'functional/images/Watson.jpeg'
    )
    I.waitForFunction(() => document.readyState === 'complete')
    I.seeElement(this.locators.mediaJpegAttach)
    I.scrollTo(this.locators.mediaPdfDrop)
    I.attachFile(this.locators.mediaJpegUpload, 'functional/images/girl.png')
    I.waitForFunction(() => document.readyState === 'complete')
    I.seeElement(this.locators.mediaJpegUploadErr)
    I.click(this.locators.mediaJpegExisting)
    I.waitForFunction(() => document.readyState === 'complete')
    I.see('.jpeg')
    I.dontSee('.png')
    I.dontSee('.pdf')
    I.click(this.locators.dogJpgCheckbox)
    I.click(this.locators.saveSelected)
    I.waitForFunction(() => document.readyState === 'complete')
    I.seeElement(this.locators.mediaJpegAdded)
    I.scrollTo(this.locators.mediaPngDrop)
    I.attachFile(this.locators.mediaPngUpload, 'functional/images/dog.jpg')
    I.waitForFunction(() => document.readyState === 'complete')
    I.seeElement(this.locators.mediaPngUploadErr)
    I.click(this.locators.mediaPngExisting)
    I.waitForFunction(() => document.readyState === 'complete')
    I.see('.png')
    I.dontSee('.jpeg')
    I.dontSee('.jpg')
    I.dontSee('.pdf')
    I.click(this.locators.girlPngCheckbox)
    I.click(this.locators.saveSelected)
    I.waitForFunction(() => document.readyState === 'complete')
    I.scrollTo(this.locators.mediaJnPDrop)
    I.seeElement(this.locators.mediaPngAdded)
    I.scrollTo(this.locators.scrollDown)
    I.attachFile(
      this.locators.mediaJnPUpload,
      'functional/images/DADI_Publish.pdf'
    )
    I.waitForFunction(() => document.readyState === 'complete')
    I.seeElement(this.locators.mediaJnPUploadErr)
    I.click(this.locators.mediaJnPExisting)
    I.waitForFunction(() => document.readyState === 'complete')
    I.see('.png')
    I.see('.jpeg')
    I.see('.jpg')
    I.dontSee('.pdf')
    I.click(this.locators.dogJpgCheckbox)
    I.click(this.locators.girlPngCheckbox)
    I.click(this.locators.saveSelected)
    I.waitForFunction(() => document.readyState === 'complete')
    I.scrollTo(this.locators.mediaJnPDevice)
    I.seeElement(this.locators.mediaJnPJpegAdded)
    I.seeElement(this.locators.mediaJnPPngAdded)
    I.scrollTo(this.locators.scrollDown)
    I.attachFile(this.locators.mediaPdfUpload, 'functional/images/girl.png')
    I.waitForFunction(() => document.readyState === 'complete')
    I.seeElement(this.locators.mediaPdfUploadErr)
    I.click(this.locators.mediaPdfExisting)
    I.waitForFunction(() => document.readyState === 'complete')
    I.see('.pdf')
    I.dontSee('.jpeg')
    I.dontSee('.jpg')
    I.dontSee('.png')
    I.click(this.locators.pdfCheckbox)
    I.click(this.locators.saveSelected)
    I.waitForFunction(() => document.readyState === 'complete')
    I.scrollTo(this.locators.mediaJnPDrop)
    I.seeElement(this.locators.mediaPdfAdded)
    I.click(this.locators.saveMenu)
    I.click(this.locators.saveGoBack)
    I.waitForText('The document has been updated')
    I.seeElement(this.locators.mediaRowInserted)
    I.see('Media Document')
  },

  async validateMiscField() {
    I.amOnPage('/field-testing/field-test-other')
    // I.wait(2)
    I.waitForFunction(() => document.readyState === 'complete')
    I.seeElement(this.locators.createNewButton)
    I.click(this.locators.createNewButton)
    I.waitForFunction(() => document.readyState === 'complete')
    I.seeInCurrentUrl('/field-test-other/new')
    I.seeElement(this.locators.colourField)
    I.seeElement(this.locators.colourSwatch)
    I.click(this.locators.colourField)
    I.seeElement(this.locators.colourContainer)
    I.seeElement(this.locators.colourPalette)
    I.seeElement(this.locators.colourPicker)
    I.seeElement(this.locators.colourHue)
    I.seeElement(this.locators.colourSlider)
    I.fillField(this.locators.colourField, '4073b1')
    const before = await I.grabValueFrom(this.locators.colourField)

    I.dragAndDrop(this.locators.colourPicker, this.locators.colourSlider)
    const after = await I.grabValueFrom(this.locators.colourField)

    I.seeStringsAreNotEqual(after, before)
    I.click(this.locators.saveMenu)
    I.click(this.locators.saveGoBack)
    I.waitForText('The document has been created')
    I.see('094285')
    // check filter only contains string filter field
    I.click(this.locators.filterButton)
    I.seeElement(this.locators.filterField)
    const filterValue = await I.grabTextFrom(this.locators.filterField)

    I.seeStringsAreEqual(filterValue, 'Normal String field')
  },

  async validateNoFilter() {
    I.amOnPage('/field-testing/no-filterable-fields')
    I.waitForFunction(() => document.readyState === 'complete')
    I.seeElement(this.locators.createNewButton)
    I.click(this.locators.createNewButton)
    I.waitForFunction(() => document.readyState === 'complete')
    I.seeInCurrentUrl('/no-filterable-fields/new')
    I.click(this.locators.saveMenu)
    I.wait(2)
    I.click(this.locators.saveGoBack)
    I.waitForText('The document has been created')
    I.seeElement(this.locators.filterButtonDisabled)
  },

  async validateSingleDocument() {
    I.amOnPage('/single-document/test-single-document')
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
