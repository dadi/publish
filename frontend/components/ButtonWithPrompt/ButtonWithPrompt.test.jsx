import {h, options, render} from 'preact'
import {expect} from 'chai'

import Button from 'components/Button/Button'
import ButtonWithPrompt from './ButtonWithPrompt'

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

describe('ButtonWithPrompt component', () => {
  it('has propTypes', () => {
    const button = (
      <ButtonWithPrompt>Click me</ButtonWithPrompt>
    )

    expect(button.nodeName.propTypes).to.exist
    expect(Object.keys(button.nodeName.propTypes)).to.have.length.above(0)
  })

  it('renders a Button component', () => {
    const button = (
      <Button
        accent="system"
        size="small"
      >Go</Button>
    )

    const buttonWithPrompt = (
      <ButtonWithPrompt
        accent="system"
        promptCallToAction="Yes"
        promptMessage="Are you sure you want to proceed with this action?"
        size="small"
      >Go</ButtonWithPrompt>
    )

    expect(buttonWithPrompt).to.contain(button)
  })

  it('hides the prompt by default', () => {
    let component

    mount(
      <ButtonWithPrompt
        accent="data"
        promptCallToAction="Yes"
        promptMessage="Are you sure you want to proceed with this action?"
        ref={c => component = c}
      >Go</ButtonWithPrompt>
    )

    expect(component.state.visible).to.equal(false)
  })

  it('opens the prompt when the button is clicked', () => {
    let component

    mount(
      <ButtonWithPrompt
        accent="data"
        promptCallToAction="Yes"
        promptMessage="Are you sure you want to proceed with this action?"
        ref={c => component = c}
      >Go</ButtonWithPrompt>
    )

    expect($('.prompt').length).to.equal(0)

    $('button')[0].click()

    expect(component.state.visible).to.equal(true)
    expect($('.prompt').length).to.equal(1)
  })

  it('closes the prompt when clicking anywhere outside the component', () => {
    let component

    mount(
      <ButtonWithPrompt
        accent="data"
        promptCallToAction="Yes"
        promptMessage="Are you sure you want to proceed with this action?"
        ref={c => component = c}
      >Go</ButtonWithPrompt>
    )

    $('button')[0].click()

    expect(component.state.visible).to.equal(true)
    expect($('.prompt').length).to.equal(1)

    document.body.click()

    expect(component.state.visible).to.equal(false)
    expect($('.prompt').length).to.equal(0)
  })

  it('calls the `onClick` callback when the prompt button is clicked', () => {
    const callback = jest.fn()

    mount(
      <ButtonWithPrompt
        accent="data"
        onClick={callback}
        promptCallToAction="Yes"
        promptMessage="Are you sure you want to proceed with this action?"
      >Go</ButtonWithPrompt>
    )

    $('button')[0].click()
    $('.prompt button')[0].click()

    expect(callback.mock.calls.length).to.equal(1)
    expect(callback.mock.calls[0].length).to.equal(1)
  })

  it('removes click event listener when component is unmounted', () => {
    let component

    const removeEventListener = jest.fn()

    mount(
      <ButtonWithPrompt
        accent="data"
        promptCallToAction="Yes"
        promptMessage="Are you sure you want to proceed with this action?"
        ref={c => component = c}
      >Go</ButtonWithPrompt>
    )

    component.promptRef.removeEventListener = removeEventListener
    const promptInsideClickHandler = component.promptInsideClickHandler
    mount(null).remove()

    expect(removeEventListener.mock.calls.length).to.equal(1)
    expect(removeEventListener.mock.calls[0][0]).to.equal('click')
    expect(removeEventListener.mock.calls[0][1]).to.equal(promptInsideClickHandler)
  })

  it('does not attempt to remove event listener if `promptRef` is undefined', () => {
    let component

    const removeEventListener = jest.fn()

    mount(
      <ButtonWithPrompt
        accent="data"
        promptCallToAction="Yes"
        promptMessage="Are you sure you want to proceed with this action?"
        ref={c => component = c}
      >Go</ButtonWithPrompt>
    )

    component.promptRef = null
    mount(null).remove()

    expect(removeEventListener.mock.calls.length).to.equal(0)
  })
})
