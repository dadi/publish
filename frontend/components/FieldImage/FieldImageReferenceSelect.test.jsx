import {h, options, render} from 'preact'
import {expect} from 'chai'

import FieldImageReferenceSelect from './FieldImageReferenceSelect'

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

describe('FieldImageReferenceSelect component', () => {
  it('has propTypes', () => {
    const component = (
      <FieldImageReferenceSelect />
    )

    expect(component.nodeName.propTypes).to.exist
    expect(Object.keys(component.nodeName.propTypes)).to.have.length.above(0)
  })
})