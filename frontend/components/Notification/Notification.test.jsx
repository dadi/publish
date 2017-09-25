import {h, options, render} from 'preact'
import {expect} from 'chai'

import Notification from './Notification'
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

describe('Notification component', () => {
  it('has propTypes', () => {
    const component = (
      <Notification />
    )

    expect(component.nodeName.propTypes).to.exist
    expect(Object.keys(component.nodeName.propTypes)).to.have.length.above(0)
  })

  it('should return `null` if required fields are not defined', () => {
    const component = (
      <Notification />
    )

    mount(component)

    expect(component).to.equal(null)
  })

  it('renders a `<span>` element containing `message` prop', () => {
    const component = (
      <Notification 
        message={'foo'}
      />
    )

    mount(component)

    expect(component).to.equal(
      <div class="container container-visible"><div class="notification notification-system"><span>foo</span></div></div>
    )
  })

  it('should return `null` if `options` prop is defined but `onOptionClick` prop not a valid function', () => {
    const component = (
      <Notification
        options={[]}
        onOptionClick={'foo'}
      />
    )

    mount(component)

    expect(component).to.equal(null)
  })

  it('renders an `<a>` for every option of type `string`', () => {
    const mockOptionClick = jest.fn()
    const component = (
      <Notification 
        message={'foo'}
        options={{foo:'http://somedomain.com'}}
        onOptionClick={mockOptionClick}
      />
    )

    mount(component)

    expect($('a.option').length).to.equal(1)
  })

  it('renders an `<button>` for every option that is not a string', () => {
    const mockOptionClick = jest.fn()
    const component = (
      <Notification 
        message={'foo'}
        options={{foo: {}}}
        onOptionClick={mockOptionClick}
      />
    )

    mount(component)

    expect($('button.option').length).to.equal(1)
  })

  it('triggers `onHover` callback when notification `<div>` `onHover` event is fired and `onHover` is valid function', () => {
    const mockOptionHover = jest.fn()
    const mockOptionClick = jest.fn()
    const component = (
      <Notification 
        message={'foo'}
        options={{}}
        onHover={mockOptionHover}
        onOptionClick={mockOptionClick}
      />
    )

    mount(component)

    const hover = new MouseEvent("mouseenter", {type: 'mouseenter'})

    $('div.notification')[0].dispatchEvent(hover)
    expect(mockOptionHover.mock.calls.length).to.equal(1)
  })

  it('does not trigger onHover event if options are not defined', () => {
    const mockOptionHover = jest.fn()
    const mockOptionClick = jest.fn()
    const component = (
      <Notification 
        message={'foo'}
        options={{foo: 'bar'}}
        onHover={mockOptionHover}
        onOptionClick={mockOptionClick}
      />
    )

    mount(component)

    const hover = new MouseEvent("mouseenter", {type: 'mouseenter'})

    $('div.notification')[0].dispatchEvent(hover)
    expect(mockOptionHover).not.to.have.been.called
  })
})
