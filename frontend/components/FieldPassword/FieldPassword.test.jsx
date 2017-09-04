import {h, options, render} from 'preact'
import {expect} from 'chai'

import FieldPassword from './FieldPassword'
import FieldPasswordEdit from './FieldPasswordEdit'

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

describe('FieldPasswordEdit component', () => {
  it('has propTypes', () => {
    const component = (
      <FieldPasswordEdit />
    )

    expect(component.nodeName.propTypes).to.exist
    expect(Object.keys(component.nodeName.propTypes)).to.have.length.above(0)
  })
})