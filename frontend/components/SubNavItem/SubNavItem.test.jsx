import {h, options, render} from 'preact'
import {expect} from 'chai'

import SubNavItem from './SubNavItem'
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

describe('SubNavItem component', () => {
  it('has propTypes', () => {
    const component = (
      <SubNavItem />
    )

    expect(component.nodeName.propTypes).to.exist
    expect(Object.keys(component.nodeName.propTypes)).to.have.length.above(0)
  })

  it('should render an `<a>` node', () => {
    const component = (
      <SubNavItem />
    )

    render(component)

    expect(component).to.contain(<a class="sub-nav-item"></a>)
  })

  it('should render `<a>` with href is prop exists', () => {
    const component = (
      <SubNavItem
        href='http://somedomain.com'
      />
    )

    render(component)

    expect(component).to.contain(<a class="sub-nav-item" href="http://somedomain.com"></a>)
  })

  it('should apply error class if prop is true', () => {
    const component = (
      <SubNavItem
        error={true}
        href='http://somedomain.com'
      />
    )

    render(component)

    expect(component).to.contain(<a class="sub-nav-item sub-nav-item-error" href="http://somedomain.com"></a>)
  })

  it('should apply active class if prop is true', () => {
    const component = (
      <SubNavItem
        active={true}
        href='http://somedomain.com'
      />
    )

    render(component)

    expect(component).to.contain(<a class="sub-nav-item sub-nav-item-active" href="http://somedomain.com"></a>)
  })
})
