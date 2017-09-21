import {h, options, render} from 'preact'
import {expect} from 'chai'

import Dropdown from './Dropdown'

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

describe('Dropdown component', () => {
  it('has propTypes', () => {
    const component = (
      <Dropdown />
    )

    expect(component.nodeName.propTypes).to.exist
    expect(Object.keys(component.nodeName.propTypes)).to.have.length.above(0)
  })

  it('renders an unordered list', () => {
    const output = render(
      <Dropdown>
        <li>Item 1</li>
        <li>Item 2</li>
      </Dropdown>
    )

    expect(output.tagName).to.equal('UL')
  })  

  it('renders a tooltip when given the `tooltip` prop', () => {
    const outputLeft = (
      <Dropdown tooltip="left">
        <li>Item 1</li>
      </Dropdown>
    )

    const outputRight = (
      <Dropdown tooltip="right">
        <li>Item 2</li>
      </Dropdown>
    )    
    
    expect(outputLeft).to.contain(
      <ul class="dropdown dropdown-tooltip dropdown-tooltip-left">
        <li>Item 1</li>
      </ul>
    )

    expect(outputRight).to.contain(
      <ul class="dropdown dropdown-tooltip dropdown-tooltip-right">
        <li>Item 2</li>
      </ul>
    )    
  })  
})