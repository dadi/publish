import {h, options, render} from 'preact'
import {expect} from 'chai'

import HeroMessage from './HeroMessage'
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

describe('HeroMessage component', () => {
  it('has propTypes', () => {
    const component = (
      <HeroMessage />
    )

    expect(component.nodeName.propTypes).to.exist
    expect(Object.keys(component.nodeName.propTypes)).to.have.length.above(0)
  })

  it('renders a div container', () => {
    const output = render(
      <HeroMessage />
    )

    expect(output.tagName).to.equal('DIV')
    expect(output.className).to.equal('container')
  })

  it('renders an h1 with the given `title` prop', () => {
    const output = (
      <HeroMessage
        title="Hello world"
      />
    )

    expect(output).to.contain(
      <h1 class="title">Hello world</h1>
    )
  })

  it('renders a paragraph with the given `subtitle` prop', () => {
    const output = (
      <HeroMessage
        subtitle="My name is Publish"
      />
    )

    expect(output).to.contain(
      <p class="subtitle">My name is Publish</p>
    )
  })

  it('renders a div with the given children', () => {
    const children = (
      <ul>
        <li>Item 1</li>
        <li>Item 2</li>
      </ul>
    )
    const output = (
      <HeroMessage
        title="Hello world"
      >
        {children}
      </HeroMessage>
    )

    expect(output).to.contain(
      <h1 class="title">Hello world</h1>
    )
    expect(output).to.contain(
      <div class="children">
        {children}
      </div>
    )
  })
})
