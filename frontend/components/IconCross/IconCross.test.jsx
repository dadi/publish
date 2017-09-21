import {h, options, render} from 'preact'
import {expect} from 'chai'

import IconCross from './IconCross'
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

describe('IconCross component', () => {
  it('has propTypes', () => {
    const component = (
      <IconCross />
    )

    expect(component.nodeName.propTypes).to.exist
    expect(Object.keys(component.nodeName.propTypes)).to.have.length.above(0)
  })

  it('has defaultProps', () => {
    const component = (
      <IconCross />
    )

    expect(component.nodeName.defaultProps).to.exist
    expect(Object.keys(component.nodeName.defaultProps)).to.have.length.above(0)
  })

  it('renders an `<svg>` dom node with a default width and height', () => {
    const component = (
      <IconCross />
    )

    mount(component)

    expect($('.icon')).to.exist
    expect(component).to.equal(
      <svg class="icon" height={10} viewBox="0 0 24 24" width={10} xmlns="http://www.w3.org/2000/svg"><title>Close</title><path d="M18.984 6.422l-5.578 5.578 5.578 5.578-1.406 1.406-5.578-5.578-5.578 5.578-1.406-1.406 5.578-5.578-5.578-5.578 1.406-1.406 5.578 5.578 5.578-5.578z" /></svg>
    )
  })

  it('renders an `<svg>` dom node with width and height based on defined component props', () => {
    const component = (
      <IconCross
        height={20}
        width={20}
      />
    )

    mount(component)

    expect($('.icon')).to.exist
    expect(component).to.equal(
      <svg class="icon" height={20} viewBox="0 0 24 24" width={20} xmlns="http://www.w3.org/2000/svg"><title>Close</title><path d="M18.984 6.422l-5.578 5.578 5.578 5.578-1.406 1.406-5.578-5.578-5.578 5.578-1.406-1.406 5.578-5.578-5.578-5.578 1.406-1.406 5.578 5.578 5.578-5.578z" /></svg>
    )
  })
})
