import {h, options, render} from 'preact'
import {expect} from 'chai'

import Page from './Page'
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

describe('Page component', () => {
  it('has propTypes', () => {
    const component = (
      <Page />
    )
  })

  it('renders a `<div>` containing passed children', () => {
    const component = (
      <Page>
        <div class="foo">Foo</div>
      </Page>
    )

    mount(component)

    expect(component).to.equal(<div class="container"><div class="foo">Foo</div></div>)
  })
})
