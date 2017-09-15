import {h, options, render} from 'preact'
import {expect} from 'chai'

import IconBurger from './IconBurger'
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

describe('IconBurger component', () => {
  it('has propTypes', () => {
    const component = (
      <IconBurger />
    )

    expect(component.nodeName.propTypes).to.exist
    expect(Object.keys(component.nodeName.propTypes)).to.have.length.above(0)
  })

  it('has defaultProps', () => {
    const component = (
      <IconBurger />
    )

    expect(component.nodeName.defaultProps).to.exist
    expect(Object.keys(component.nodeName.defaultProps)).to.have.length.above(0)
  })

  it('renders an `<svg>` dom node with a default width and height', () => {
    const component = (
      <IconBurger />
    )

    mount(component)

    expect($('.icon')).to.exist
    expect(component).to.equal(
      <svg class="icon" height={10} viewBox="0 0 20 16"  width={10} xmlns="http://www.w3.org/2000/svg"><title>Menu</title><path d="M1.178 1h17.69M1.178 8h17.69m-17.69 7h17.69" fill-rule="evenodd" stroke-linecap="square" stroke-width="2"></path></svg>
    )
  })

  it('renders an `<svg>` dom node with width and height based on defined component props', () => {
    const component = (
      <IconBurger 
        width={20}
        height={30}
      />
    )

    mount(component)

    expect($('.icon')).to.exist
    expect(component).to.equal(
      <svg class="icon" height={30} viewBox="0 0 20 16"  width={20} xmlns="http://www.w3.org/2000/svg"><title>Menu</title><path d="M1.178 1h17.69M1.178 8h17.69m-17.69 7h17.69" fill-rule="evenodd" stroke-linecap="square" stroke-width="2"></path></svg>
    )
  })
})