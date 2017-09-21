import {h, options, render} from 'preact'
import {expect} from 'chai'

import DropdownItem from './DropdownItem'

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

describe('DropdownItem component', () => {
  it('has propTypes', () => {
    const component = (
      <DropdownItem />
    )

    expect(component.nodeName.propTypes).to.exist
    expect(Object.keys(component.nodeName.propTypes)).to.have.length.above(0)
  })

  it('renders a list item', () => {
    const output = render(
      <DropdownItem>Item</DropdownItem>
    )

    expect(output.tagName).to.equal('LI')
  })

  describe('when given a `href` prop', () => {
    it('renders a list item with an anchor', () => {
      const output = (
        <DropdownItem
          href="foobar.com"
        >Click me</DropdownItem>
      )

      expect(output).to.contain(
        <li>
          <a class="dropdown-item" href="foobar.com">Click me</a>
        </li>
      )
    })

    it('renders the appropriate class when given the `active` prop', () => {
      const output = (
        <DropdownItem
          active={true}
          href="foobar.com"
        >Click me</DropdownItem>
      )

      expect(output).to.contain(
        <li>
          <a class="dropdown-item dropdown-item-active" href="foobar.com">Click me</a>
        </li>
      )
    })

    it('fires the `onClick` callback when the item is clicked', () => {
      const onClick = jest.fn()

      let component

      mount(
        <DropdownItem
          href="foobar.com"
          onClick={onClick}
          ref={c => component = c}
        >Click me</DropdownItem>
      )

      $('a')[0].click()

      expect(onClick.mock.calls.length).to.equal(1)
      expect(onClick.mock.calls[0].length).to.equal(1)
      expect(onClick.mock.calls[0][0].constructor.name).to.equal('MouseEvent')
    })
  })

  describe('when not given a `href` prop', () => {
    it('renders a list item with a button ', () => {
      const output = (
        <DropdownItem>Click me</DropdownItem>
      )

      expect(output).to.contain(
        <li>
          <button class="dropdown-item" type="button">Click me</button>
        </li>
      )
    })

    it('renders the appropriate class when given the `active` prop', () => {
      const output = (
        <DropdownItem
          active={true}
        >Click me</DropdownItem>
      )

      expect(output).to.contain(
        <li>
          <button class="dropdown-item dropdown-item-active" type="button">Click me</button>
        </li>
      )
    })

    it('fires the `onClick` callback when the item is clicked', () => {
      const onClick = jest.fn()

      let component

      mount(
        <DropdownItem
          onClick={onClick}
          ref={c => component = c}
        >Click me</DropdownItem>
      )

      $('button')[0].click()

      expect(onClick.mock.calls.length).to.equal(1)
      expect(onClick.mock.calls[0].length).to.equal(1)
      expect(onClick.mock.calls[0][0].constructor.name).to.equal('MouseEvent')
    })
  })
})