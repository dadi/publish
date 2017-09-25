import {h, options, render} from 'preact'
import {expect} from 'chai'

import NavItem from './NavItem'
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

describe('NavItem component', () => {
  it('has propTypes', () => {
    const component = (
      <NavItem />
    )

    expect(component.nodeName.propTypes).to.exist
    expect(Object.keys(component.nodeName.propTypes)).to.have.length.above(0)
  })

  it('should return `null` if required fields are not defined', () => {
    const componentWithNoParams = (
      <NavItem/>
    )

    mount(componentWithNoParams)

    expect(componentWithNoParams).to.equal(null)
  })

  it('renders an `<li>` node', () => {
    const component = (
      <NavItem
        text={'Foo'}
        href={'/'}
      />
    )

    mount(component)

    expect(component).not.to.equal(null)
    expect($('li').length).to.equal(1)
  })

  it('renders an `<a>` node inside `<li>`', () => {
    const component = (
      <NavItem
        text={'Foo'}
        href={'/foo'}
      />
    )

    mount(component)

    expect(component).to.equal(<li class="container container-desktop"><a class="nav-item" href="/foo">Foo</a></li>)
  })

  it('toggles expanded state on hover', () => {
    let component

    mount(
      <NavItem
        text={'Foo'}
        href={'/foo'}
        ref={c => component = c}
      />
    )
    const hover = new MouseEvent("mouseenter", {type: 'mouseenter'})

    $('li.container')[0].dispatchEvent(hover)

    expect(component.state.expanded).to.be.true
  })
})
