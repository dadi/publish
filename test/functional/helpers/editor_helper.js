'use strict'

/*global window KeyboardEvent:true*/

// const {
//   expect
// } = require('chai')

class Editor extends Helper {
  async getPage() {
    return this.helpers['Puppeteer'].page
  }

  async typeAndSelect(locator, text) {
    const page = await this.getPage()

    await page.click(locator.value)
    await page.keyboard.type(text)
    await page.keyboard.down('Shift')

    for (let i = 0; i < text.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      await page.keyboard.press('ArrowLeft')
    }

    await page.keyboard.up('Shift')

    // await page.click(locators.boldButton.value)
  }

  async getThePage() {
    console.log('this :', this)
    const browser = this.helpers['Puppeteer'].browser
    const x = await browser.pages() // List of pages in the browser

    const currentPage = this.helpers['Puppeteer'].page
    const y = await currentPage.url() // Get the url of the current page

    console.log('object :', x, y)
  }

  async emulateCommandButtonPressSave() {
    const page = await this.getPage()

    await page.evaluate(() => {
      const isMac = /Mac|iPod|iPhone|iPad/.test(window.navigator.platform)

      document.activeElement.dispatchEvent(
        new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          key: isMac ? 'Meta' : 'Control',
          code: isMac ? 'MetaLeft' : 'ControlLeft',
          location: window.KeyboardEvent.DOM_KEY_LOCATION_LEFT,
          getModifierState: keyArg => keyArg === (isMac ? 'Meta' : 'Control'),
          ctrlKey: !isMac,
          metaKey: isMac,
          charCode: 0,
          keyCode: isMac ? 93 : 17,
          which: isMac ? 93 : 17
        })
      )

      document.activeElement.dispatchEvent(
        new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          key: 's',
          code: 'KeyS',
          location: window.KeyboardEvent.DOM_KEY_LOCATION_STANDARD,
          getModifierState: keyArg => keyArg === (isMac ? 'Meta' : 'Control'),
          ctrlKey: !isMac,
          metaKey: isMac,
          charCode: 0,
          keyCode: 83,
          which: 83
        })
      )

      // const wasPrevented = (
      //   !document.activeElement.dispatchEvent(preventableEvent) ||
      //   preventableEvent.defaultPrevented
      // )

      // if (!wasPrevented) {
      //   document.execCommand('selectall', false, null)
      // }

      document.activeElement.dispatchEvent(
        new KeyboardEvent('keyup', {
          bubbles: true,
          cancelable: true,
          key: isMac ? 'Meta' : 'Control',
          code: isMac ? 'MetaLeft' : 'ControlLeft',
          location: window.KeyboardEvent.DOM_KEY_LOCATION_LEFT,
          getModifierState: () => false,
          charCode: 0,
          keyCode: isMac ? 93 : 17,
          which: isMac ? 93 : 17
        })
      )
    })
  }

  async emulateCommandButtonPressBold() {
    const page = await this.getPage()

    await page.evaluate(() => {
      const isMac = /Mac|iPod|iPhone|iPad/.test(window.navigator.platform)

      document.activeElement.dispatchEvent(
        new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          key: isMac ? 'Meta' : 'Control',
          code: isMac ? 'MetaLeft' : 'ControlLeft',
          location: window.KeyboardEvent.DOM_KEY_LOCATION_LEFT,
          getModifierState: keyArg => keyArg === (isMac ? 'Meta' : 'Control'),
          ctrlKey: !isMac,
          metaKey: isMac,
          charCode: 0,
          keyCode: isMac ? 93 : 17,
          which: isMac ? 93 : 17
        })
      )

      // const preventableEvent = new KeyboardEvent('keydown', {
      document.activeElement.dispatchEvent(
        new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          key: 'b',
          code: 'KeyB',
          location: window.KeyboardEvent.DOM_KEY_LOCATION_STANDARD,
          getModifierState: keyArg => keyArg === (isMac ? 'Meta' : 'Control'),
          ctrlKey: !isMac,
          metaKey: isMac,
          charCode: 0,
          keyCode: 66,
          which: 66
        })
      )

      // const wasPrevented = (
      //   !document.activeElement.dispatchEvent(preventableEvent) ||
      //   preventableEvent.defaultPrevented
      // )

      // if (!wasPrevented) {
      //   document.execCommand('selectall', false, null)
      // }

      document.activeElement.dispatchEvent(
        new KeyboardEvent('keyup', {
          bubbles: true,
          cancelable: true,
          key: isMac ? 'Meta' : 'Control',
          code: isMac ? 'MetaLeft' : 'ControlLeft',
          location: window.KeyboardEvent.DOM_KEY_LOCATION_LEFT,
          getModifierState: () => false,
          charCode: 0,
          keyCode: isMac ? 93 : 17,
          which: isMac ? 93 : 17
        })
      )
    })
  }

  async emulateCommandButtonPressItalic() {
    const page = await this.getPage()

    await page.evaluate(() => {
      const isMac = /Mac|iPod|iPhone|iPad/.test(window.navigator.platform)

      document.activeElement.dispatchEvent(
        new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          key: isMac ? 'Meta' : 'Control',
          code: isMac ? 'MetaLeft' : 'ControlLeft',
          location: window.KeyboardEvent.DOM_KEY_LOCATION_LEFT,
          getModifierState: keyArg => keyArg === (isMac ? 'Meta' : 'Control'),
          ctrlKey: !isMac,
          metaKey: isMac,
          charCode: 0,
          keyCode: isMac ? 93 : 17,
          which: isMac ? 93 : 17
        })
      )

      document.activeElement.dispatchEvent(
        new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          key: 'i',
          code: 'KeyI',
          location: window.KeyboardEvent.DOM_KEY_LOCATION_STANDARD,
          getModifierState: keyArg => keyArg === (isMac ? 'Meta' : 'Control'),
          ctrlKey: !isMac,
          metaKey: isMac,
          charCode: 0,
          keyCode: 73,
          which: 73
        })
      )

      // const wasPrevented = (
      //   !document.activeElement.dispatchEvent(preventableEvent) ||
      //   preventableEvent.defaultPrevented
      // )

      // if (!wasPrevented) {
      //   document.execCommand('selectall', false, null)
      // }

      document.activeElement.dispatchEvent(
        new KeyboardEvent('keyup', {
          bubbles: true,
          cancelable: true,
          key: isMac ? 'Meta' : 'Control',
          code: isMac ? 'MetaLeft' : 'ControlLeft',
          location: window.KeyboardEvent.DOM_KEY_LOCATION_LEFT,
          getModifierState: () => false,
          charCode: 0,
          keyCode: isMac ? 93 : 17,
          which: isMac ? 93 : 17
        })
      )
    })
  }
}

module.exports = Editor
