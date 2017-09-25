import {h, options, render} from 'preact'
import {expect} from 'chai'

import Peer from './Peer'
import Button from './../Button/Button'
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

const mockPeer = {
  name: 'Foo'
}

describe('Peer component', () => {
  it('has propTypes', () => {
    const component = (
      <Peer />
    )

    expect(component.nodeName.propTypes).to.exist
    expect(Object.keys(component.nodeName.propTypes)).to.have.length.above(0)
  })

  it('has defaultProps', () => {
    const component = (
      <Peer />
    )

    expect(component.nodeName.defaultProps).to.exist
    expect(Object.keys(component.nodeName.defaultProps)).to.have.length.above(0)
  })

  it ('returns `null` if required props are invalid', () => {
    const component = (
      <Peer />
    )

    mount(component)

    expect(component).to.equal(null)
  })

  it ('renders `Button` component if required props are valid', () => {
    const component = (
      <Peer 
        peer={mockPeer}
      />
    )

    expect(component).to.contain(
      <Button
        accent="data"
        className="avatar active"
        type="mock"
      >F</Button>
    )
  })

  it ('renders `Button` with/without active class depending on `active` prop boolean', () => {
    const component = (
      <Peer 
        active={false}
        peer={mockPeer}
      />
    )

    expect(component).to.contain(
      <Button
        accent="data"
        className="avatar"
        type="mock"
      >F</Button>
    )
  })
})
