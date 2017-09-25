import {h, options, render} from 'preact'
import {expect} from 'chai'

import FileUpload from './FileUpload'
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

describe('FileUpload component', () => {
  it('has propTypes', () => {
    const component = (
      <FileUpload />
    )

    expect(component.nodeName.propTypes).to.exist
    expect(Object.keys(component.nodeName.propTypes)).to.have.length.above(0)
  })

  it('should render a `<div>` with an `<input>` and `<button>` inside', () => {
    const component = (
      <FileUpload />
    )

    mount(component)

    expect($('div input').length).to.equal(1)
    expect($('div label').length).to.equal(1)
  })

  it('should trigger `onChange` callback when input changes and `onChange` prop exists', () => {
    const onChange = jest.fn()
    const component = (
      <FileUpload
        onChange={onChange}
      />
    )

    mount(component)

    const change = new Event('change', {})
    $('div input')[0].dispatchEvent(change)
    expect(onChange.mock.calls.length).to.equal(1)
  })

  it('should not trigger `onChange` callback when prop is invalid', () => {
    const onChange = jest.fn()
    const component = (
      <FileUpload
        onChange={'foo'}
      />
    )

    mount(component)

    const change = new Event('change', {})
    $('div input')[0].dispatchEvent(change)

    expect(onChange.mock.calls.length).not.to.equal(1)
  })
})
