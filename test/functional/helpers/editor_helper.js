'use strict'

// const {
//   expect
// } = require('chai')

class Editor extends Helper {
  async getPage () {
    return this.helpers['Puppeteer'].page
  }

  async typeAndSelect (locator, text) {
    let page = await this.getPage()

    await page.click(locator.value)
    await page.keyboard.type(text)
    await page.keyboard.down('Shift')

    for (let i = 0; i < text.length; i++) {
      await page.keyboard.press('ArrowLeft')
    }

    await page.keyboard.up('Shift')

    // await page.click(locators.boldButton.value)
  }

  async getThePage () {
    console.log('this :', this)
    const browser = this.helpers['Puppeteer'].browser
    let x = await browser.pages() // List of pages in the browser

    const currentPage = this.helpers['Puppeteer'].page
    let y = await currentPage.url() // Get the url of the current page
    console.log('object :', x, y)
  }
}

module.exports = Editor
