import {h, options, render} from 'preact'
import {expect} from 'chai'

import Table from './Table'
import TableHead from './TableHead'
import TableHeadCell from './TableHeadCell'
import TableRow from './TableRow'
import TableRowCell from './TableRowCell'
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

describe('Table component', () => {
  it('has propTypes', () => {
    const component = (
      <Table />
    )

    expect(component.nodeName.propTypes).to.exist
    expect(Object.keys(component.nodeName.propTypes)).to.have.length.above(0)
  })
})

describe('TableHead component', () => {
  it('has propTypes', () => {
    const component = (
      <TableHead />
    )

    expect(component.nodeName.propTypes).to.exist
    expect(Object.keys(component.nodeName.propTypes)).to.have.length.above(0)
  })
})

describe('TableHeadCell component', () => {
  it('has propTypes', () => {
    const component = (
      <TableHeadCell />
    )

    expect(component.nodeName.propTypes).to.exist
    expect(Object.keys(component.nodeName.propTypes)).to.have.length.above(0)
  })
})

describe('TableRow component', () => {
  it('has propTypes', () => {
    const component = (
      <TableRow />
    )

    expect(component.nodeName.propTypes).to.exist
    expect(Object.keys(component.nodeName.propTypes)).to.have.length.above(0)
  })
})

describe('TableRowCell component', () => {
  it('has propTypes', () => {
    const component = (
      <TableRowCell />
    )

    expect(component.nodeName.propTypes).to.exist
    expect(Object.keys(component.nodeName.propTypes)).to.have.length.above(0)
  })
})