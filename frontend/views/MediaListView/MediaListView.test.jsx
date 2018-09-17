import {h, options, render} from 'preact'
import {expect} from 'chai'

import MediaListView from './MediaListView'
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

describe('MediaListView component', () => {
  it('has propTypes', () => {
    const component = (
      <MediaListView />
    )
  })
})
