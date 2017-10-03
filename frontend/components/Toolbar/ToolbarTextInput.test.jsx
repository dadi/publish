import {h, options, render} from 'preact'
import {expect} from 'chai'

import ToolbarTextInput from './ToolbarTextInput'

import TextInput from 'components/TextInput/TextInput'

// DOM setup
let $, mount, root, scratch

options.debounceRendering = f => f()

beforeAll(() => {
  $ = sel => scratch.querySelectorAll(sel)
  mount = jsx => root = render(jsx, scratch, root)
  scratch = document.createElement('div')
})

beforeEach(() => {
  document.body.appendChild(scratch)
})

afterEach(() => {
  mount(null).remove()
  document.body.removeChild(document.body.firstChild)
})

describe('Toolbar component', () => {
  it('has propTypes', () => {
    const component = (
      <ToolbarTextInput />
    )

    expect(component.nodeName.propTypes).to.exist
    expect(Object.keys(component.nodeName.propTypes)).to.have.length.above(0)
  })

  it('renders a `<TextInput>` component', () => {
    const component = (
      <ToolbarTextInput />
    )

    const template = (
      <input class='input input'/>
    )

    expect(component).to.matchTemplate(template)
  })

  it('applies a placeholder if `placeholder` prop is defined', () => {
    const component = (
      <ToolbarTextInput
        placeholder={'foo'}
      />
    )

    const template = (
      <input class='input input' placeholder='foo'/>
    )

    expect(component).to.matchTemplate(template)
  })

  it('accepts extra classnames when `className` prop exists', () => {
    const component = (
      <ToolbarTextInput
        className={'container-padded'}
      />
    )

    const template = (
      <input class='input input container-padded'/>
    )

    expect(component).to.matchTemplate(template)
  })
})
