import {h, options, render} from 'preact'
import {expect} from 'chai'

import Checkbox from './Checkbox'

// DOM setup
let $, mount, root, scratch

options.debounceRendering = f => f()

beforeAll(() => {
  $ = (sel, all) => all ? scratch.querySelectorAll(sel) : scratch.querySelector(sel)
  mount = jsx => root = render(jsx, scratch, root)
  scratch = document.createElement('div')
})

afterEach(() => {
  mount(null).remove()
})

describe.only('Checkbox component', () => {
  it('has propTypes', () => {
    const button = (
      <Checkbox />
    )

    expect(button.nodeName.propTypes).to.exist
    expect(Object.keys(button.nodeName.propTypes)).to.have.length.above(0)
  })

  it('renders an input element with the type `checkbox`', () => {
    const checkbox = (
      <Checkbox />
    )

    expect(checkbox).to.equal(
      <input class="checkbox" type="checkbox" />
    )
  })

  it('applies the ID supplied in the `id` prop', () => {
    const checkbox = (
      <Checkbox id="foo" />
    )

    expect(checkbox).to.equal(
      <input id="foo" class="checkbox" type="checkbox" />
    )
  })

  it('is checked if the `value` prop is truthy', () => {
    const checkbox = (
      <Checkbox
        value={true}
      />
    )

    expect(checkbox).to.equal(
      <input class="checkbox" type="checkbox" checked />
    )
  })

  it('is checked by default if the `value` prop is truthy', () => {
    const callback = jest.fn()

    mount(
      <Checkbox
        onChange={callback}
      />
    )

    $('input').click()

    expect(callback.mock.calls.length).to.equal(1)
    expect(callback.mock.calls[0].length).to.equal(1)
  })
})
