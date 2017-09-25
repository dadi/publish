import {h, options, render} from 'preact'
import {expect} from 'chai'

import Checkbox from './Checkbox'

// DOM setup
let $, mount, root, scratch

options.debounceRendering = f => f()

beforeAll(() => {
  $ = sel => scratch.querySelectorAll(sel)
  mount = jsx => {
    root = render(jsx, scratch, root)

    document.body.appendChild(scratch)

    return root
  }
  scratch = document.createElement('div')
})

afterEach(() => {
  mount(null).remove()
})

describe('Checkbox component', () => {
  it('has propTypes', () => {
    const component = (
      <Checkbox />
    )

    expect(component.nodeName.propTypes).to.exist
    expect(Object.keys(component.nodeName.propTypes)).to.have.length.above(0)
  })

  it('renders an input element with the type `checkbox`', () => {
    const component = (
      <Checkbox />
    )

    expect(component).to.equal(
      <input class="checkbox" type="checkbox" />
    )
  })

  it('applies the ID supplied in the `id` prop', () => {
    const component = (
      <Checkbox id="foo" />
    )

    expect(component).to.equal(
      <input id="foo" class="checkbox" type="checkbox" />
    )
  })

  it('is checked if the `value` prop is truthy', () => {
    const component = (
      <Checkbox
        value={true}
      />
    )

    expect(component).to.equal(
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

    $('input')[0].click()

    expect(callback.mock.calls.length).to.equal(1)
    expect(callback.mock.calls[0].length).to.equal(1)
  })
})
