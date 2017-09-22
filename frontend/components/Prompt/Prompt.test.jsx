import {h, options, render} from 'preact'
import {expect} from 'chai'

import Button from './../Button/Button'
import Prompt from './Prompt'
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

describe('Prompt component', () => {
  it('has propTypes', () => {
    const component = (
      <Prompt />
    )

    expect(component.nodeName.propTypes).to.exist
    expect(Object.keys(component.nodeName.propTypes)).to.have.length.above(0)
  })

  it('renders a div container with a default accent and position', () => {
    const output = render(
      <Prompt />
    )

    expect(output.tagName).to.equal('DIV')
    expect(output.className).to.contain('container')
    expect(output.className).to.contain('container-destruct')
    expect(output.className).to.contain('container-left')
  })

  it('sets the correct class based on the given `accent` prop', () => {
    const output = render(
      <Prompt accent="system" />
    )

    expect(output.tagName).to.equal('DIV')
    expect(output.className).to.contain('container')
    expect(output.className).to.contain('container-system')
  })

  it('sets the correct class based on the given `position` prop', () => {
    const output = render(
      <Prompt accent="right" />
    )

    expect(output.tagName).to.equal('DIV')
    expect(output.className).to.contain('container')
    expect(output.className).to.contain('container-right')
  })

  it('renders children', () => {
    const children = (
      <ul>
        <li>Item 1</li>
        <li>Item 2</li>
      </ul>
    )
    const output = (
      <Prompt>
        {children}
      </Prompt>
    )

    expect(output).to.contain(children)
  })

  it('renders the action button', () => {
    const callback = (a) => a * 2
    const output = (
      <Prompt
        action="Click me"
        onClick={callback}
      />
    )

    expect(output).to.contain(
      <div class="action">
        <Button
          accent="destruct"
          onClick={callback}
          size="small"
        >Click me</Button>
      </div>
    )

    expect(output.attributes.onClick.toString()).to.equal(callback.toString())
  })
})
