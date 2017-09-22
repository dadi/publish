import {h, options, render} from 'preact'
import {expect} from 'chai'

import IconArrow from './IconArrow'
import styles from './IconArrow.css'
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

describe('IconArrow component', () => {
  it('has propTypes', () => {
    const component = (
      <IconArrow />
    )

    expect(component.nodeName.propTypes).to.exist
    expect(Object.keys(component.nodeName.propTypes)).to.have.length.above(0)
  })

  it('has defaultProps', () => {
    const component = (
      <IconArrow />
    )

    expect(component.nodeName.defaultProps).to.exist
    expect(Object.keys(component.nodeName.defaultProps)).to.have.length.above(0)
  })

  it('renders a `<span>` dom node with a default direction of up', () => {
    const component = (
      <IconArrow />
    )

    expect(component).to.equal(
      <span class="icon" style="border-width: 0px 5px 10px 5px;border-color: transparent transparent currentColor transparent;" />
    )
  })

  it('renders a upward pointing svg when `direction` prop is `up`', () => {
    const component = (
      <IconArrow
        direction={'up'}
      />
    )
    
    expect(component).to.equal(
      <span class="icon" style="border-width: 0px 5px 10px 5px;border-color: transparent transparent currentColor transparent;" />
    )
  })

  it('renders a downward pointing svg when `direction` prop is `down`', () => {
    const component = (
      <IconArrow
        direction={'down'}
      />
    )
    
    expect(component).to.equal(
      <span class="icon" style="border-width: 10px 5px 0px 5px;border-color: currentColor transparent transparent transparent;" />
    )
  })

  it('renders a left pointing svg when `direction` prop is `left`', () => {
    const component = (
      <IconArrow
        direction={'left'}
      />
    )
    
    expect(component).to.equal(
      <span class="icon" style="border-width: 5px 10px 5px 0px;border-color: transparent currentColor transparent transparent;" />
    )
  })

  it('renders a right pointing svg when `direction` prop is `right`', () => {
    const component = (
      <IconArrow
        direction={'right'}
      />
    )
    
    expect(component).to.equal(
      <span class="icon" style="border-width: 5px 0px 5px 10px;border-color: transparent transparent transparent currentColor;" />
    )
  })

  it('increases border width property to match height and width', () => {
    const component = (
      <IconArrow
        width={20}
        height={10}
      />
    )
    
    expect(component).to.equal(
      <span class="icon" style="border-width: 0px 10px 10px 10px;border-color: transparent transparent currentColor transparent;" />
    )
  })

  it('append a classname to the existing default classes', () => {
    const customClassName = 'foo'
    const component = render(
      <IconArrow
        width={20}
        height={10}
        className={customClassName}
      />
    )
    
    expect(component.getAttribute('class')).to.equal([styles.icon, customClassName].join(' '))
  })
})