import {h, options, render} from 'preact'
import {expect} from 'chai'

import App from './App'
import MockStore from './MockStore'

// DOM setup
let $, mount, root, scratch

options.debounceRendering = f => f()

beforeAll(() => {
  $ = sel => scratch.querySelectorAll(sel)
  mount = jsx => root = render(jsx, scratch, root)
  scratch = document.createElement('div')
})

beforeEach(() => {
  document.body.appendChild(scratch)
})

afterEach(() => {
  mount(null).remove()

  document.body.removeChild(document.body.firstChild)
})

describe('App', () => {
  it('renders an error view if connection to an api fails or api paths are not defined', () => {
    const component = (
      <MockStore>
        <App />
      </MockStore>
    )
    mount(component)

    // expect(component).to.contain(<div></div>)
  })
})
