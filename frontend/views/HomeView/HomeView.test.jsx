import {h, options, render} from 'preact'
import {expect} from 'chai'

import HomeView from './HomeView'
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

describe('HomeView component', () => {
  it('has propTypes', () => {
    const component = (
      <HomeView />
    )
  })
})
