import {h, options, render} from 'preact'
import {expect} from 'chai'

import FieldNumber from './FieldNumber'
import FieldNumberEdit from './FieldNumberEdit'
import FieldNumberFilter from './FieldNumberFilter'

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

describe('FieldNumberEdit component', () => {
  it('has propTypes', () => {
    const component = (
      <FieldNumberEdit />
    )

    expect(component.nodeName.propTypes).to.exist
    expect(Object.keys(component.nodeName.propTypes)).to.have.length.above(0)
  })
})

describe('FieldNumberFilter component', () => {
  it('has propTypes', () => {
    const component = (
      <FieldNumberFilter />
    )

    expect(component.nodeName.propTypes).to.exist
    expect(Object.keys(component.nodeName.propTypes)).to.have.length.above(0)
  })
})