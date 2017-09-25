import {h, options, render} from 'preact'
import {expect} from 'chai'

import TextInput from './TextInput'
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

describe('TextInput component', () => {
  it('has propTypes', () => {
    const component = (
      <TextInput />
    )

    expect(component.nodeName.propTypes).to.exist
    expect(Object.keys(component.nodeName.propTypes)).to.have.length.above(0)
  })

  it('renders a `<textarea>` if `type` prop is "multiline"', () => {
    const component = (
      <TextInput
        type='multiline'
      />
    )

    mount(component)
    const textInput = $('textarea')
    expect(textInput.length).to.equal(1)
  })

  it('renders an `<input>` by default', () => {
    const component = (
      <TextInput />
    )

    mount(component)
    const textInput = $('input')
    expect(textInput.length).to.equal(1)
  })

  it('fires the `onChange` callback when the input value changes and `onChange` prop is a valid function', () => {
    const onChange = jest.fn()

    let component

    mount(
      <TextInput
        onChange={onChange}
        ref={c => component = c}
      />
    )

    $('input')[0].focus()

    const change = new Event("change", {
        type: 'change'
    })
    // Dispatch fake change event 
    $('input')[0].dispatchEvent(change)
    expect(onChange.mock.calls.length).to.equal(1)
  })

  it('fires the `onKeyUp` callback when a keyup event is fired and `onKeyUp` prop is a valid function', () => {
    const onKeyUp = jest.fn()

    let component

    mount(
      <TextInput
        onKeyUp={onKeyUp}
        ref={c => component = c}
      />
    )

    $('input')[0].focus()

    const change = new KeyboardEvent("keyup", {
        type: 'keyup'
    })
    // Dispatch fake change event 
    $('input')[0].dispatchEvent(change)
    expect(onKeyUp.mock.calls.length).to.equal(1)
  })

  it('fires the `onFocus` callback when the input is focussed and `onFocus` prop is a valid function', () => {
    const onFocus = jest.fn()

    let component

    mount(
      <TextInput
        onFocus={onFocus}
        ref={c => component = c}
      />
    )

    $('input')[0].focus()

    // Dispatch fake change event 
    expect(onFocus.mock.calls.length).to.equal(1)
  })

  it('fires the `onBlur` callback when the input is de-selected and `onBlur` prop is a valid function', () => {
    const onBlur = jest.fn()

    let component

    mount(
      <TextInput
        onBlur={onBlur}
        ref={c => component = c}
      />
    )

    $('input')[0].focus()
    $('input')[0].blur()

    // Dispatch fake blur event 
    expect(onBlur.mock.calls.length).to.equal(1)
  })

  it('fires the `validation` callback with current value when the input changes value and `validation` prop is a valid function', () => {
    const validation = jest.fn()

    let component

    mount(
      <TextInput
        validation={validation}
        value={'foo'}
        ref={c => component = c}
      />
    )

    $('input')[0].focus()

    const change = new Event("change", {
        type: 'change'
    })
    // Dispatch fake change event 
    $('input')[0].dispatchEvent(change)
    expect(validation.mock.calls.length).to.equal(1)
    expect(validation.mock.calls[0][0]).to.equal('foo')
  })
})
