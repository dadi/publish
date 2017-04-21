import {h, render} from 'preact'
import {expect} from 'chai'

import Button from './Button'

// DOM setup
let rootEl, $, mount

beforeAll(() => {
  rootEl = document.createElement('div')
  document.body.appendChild(rootEl)

  $ = s => rootEl.querySelector(s)

  mount = jsx => render(jsx, rootEl, rootEl.firstChild)
})

afterEach(() => {
  mount(() => null)

  rootEl.innerHTML = ''
})

afterAll(() => {
  document.body.removeChild(rootEl)
})

describe('ButtonWithOptions component', () => {
  it('has propTypes', () => {
    const button = (
      <ButtonWithOptions>Click me</ButtonWithOptions>
    )

    expect(button.nodeName.propTypes).to.exist
    expect(Object.keys(button.nodeName.propTypes)).to.have.length.above(0)
  })

  it('renders as a `<a>` element when given a `href` prop', () => {
    const button = (
      <Button
        accent="neutral"
        href="/foobar"
      >Click me</Button>      
    )
    
    expect(button).to.contain(
      <a href="/foobar" class="button button-neutral">Click me</a>
    )
  })

  it('executes the `onClick` callback when clicked, with the event as argument', () => {
    const onClick = jest.fn()

    mount(
      <Button onClick={onClick}>Click me</Button>
    )

    $('button').click()

    expect(onClick.mock.calls.length).to.equal(1)
    expect(onClick.mock.calls[0].length).to.equal(1)
    expect(onClick.mock.calls[0][0].constructor.name).to.equal('MouseEvent')
  })
})
