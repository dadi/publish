import {h, options, render} from 'preact'
import {expect} from 'chai'

import DocumentListView from './DocumentListView'
// DOM setup
let $, mount, root, scratch

options.debounceRendering = f => f()

beforeAll(() => {
  $ = sel => scratch.querySelectorAll(sel)
  mount = jsx => root = render(jsx, scratch, root)
  scratch = document.createElement('div')
})

afterEach(() => {
  mount(null).remove()
})

describe('DocumentListView component', () => {
  it('has propTypes', () => {
    const component = (
      <DocumentListView />
    )
  })
})
