import {h, options, render} from 'preact'
import {expect} from 'chai'

import FieldString from './FieldString'
import FieldStringEdit from './FieldStringEdit'
import FieldStringFilter from './FieldStringFilter'
import FieldStringList from './FieldStringList'

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

describe('FieldStringEdit component', () => {
  it('has propTypes', () => {
    const component = (
      <FieldStringEdit />
    )

    expect(component.nodeName.propTypes).to.exist
    expect(Object.keys(component.nodeName.propTypes)).to.have.length.above(0)
  })
})

describe('FieldStringFilter component', () => {
  it('has propTypes', () => {
    const component = (
      <FieldStringFilter />
    )

    expect(component.nodeName.propTypes).to.exist
    expect(Object.keys(component.nodeName.propTypes)).to.have.length.above(0)
  })
})

describe('FieldStringList component', () => {
  it('has propTypes', () => {
    const component = (
      <FieldStringList />
    )

    expect(component.nodeName.propTypes).to.exist
    expect(Object.keys(component.nodeName.propTypes)).to.have.length.above(0)
  })
})