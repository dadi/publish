import {h, options, render} from 'preact'
import {expect} from 'chai'

jest.mock('lib/util', () => ({
  getUniqueId: () => 'c1'
}))

import FieldBooleanList from './FieldBooleanList'

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
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild)
  }  
})

describe('FieldBooleanList component', () => {
  it('has propTypes', () => {
    const component = (
      <FieldBooleanList />
    )

    expect(component.nodeName.propTypes).to.exist
    expect(Object.keys(component.nodeName.propTypes)).to.have.length.above(0)
  })

  it('renders the text "Yes" if the `value` prop is truthy', () => {
    const component = render(
      <FieldBooleanList
        value={true}
      />
    )

    expect(component.nodeValue).to.eql('Yes')
  })

  it('renders the text "No" if the `value` prop is falsy', () => {
    const component = render(
      <FieldBooleanList
        value={false}
      />
    )

    expect(component.nodeValue).to.eql('No')
  })
})
