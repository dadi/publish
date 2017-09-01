import {h, options, render} from 'preact'
import {expect} from 'chai'

import FieldBoolean from './FieldBoolean'
import FieldBooleanEdit from './FieldBooleanEdit'
import FieldBooleanFilter from './FieldBooleanFilter'
import FieldBooleanList from './FieldBooleanList'

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

describe('FieldBooleanEdit component', () => {
  it('has propTypes', () => {
    const component = (
      <FieldBooleanEdit />
    )

    expect(component.nodeName.propTypes).to.exist
    expect(Object.keys(component.nodeName.propTypes)).to.have.length.above(0)
  })
})

describe('FieldBooleanFilter component', () => {
  it('has propTypes', () => {
    const component = (
      <FieldBooleanFilter />
    )

    expect(component.nodeName.propTypes).to.exist
    expect(Object.keys(component.nodeName.propTypes)).to.have.length.above(0)
  })
})

describe('FieldBooleanList component', () => {
  it('has propTypes', () => {
    const component = (
      <FieldBooleanList />
    )

    expect(component.nodeName.propTypes).to.exist
    expect(Object.keys(component.nodeName.propTypes)).to.have.length.above(0)
  })
})