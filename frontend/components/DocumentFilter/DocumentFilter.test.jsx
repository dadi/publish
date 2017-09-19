import {h, options, render} from 'preact'
import {expect} from 'chai'

import Button from 'components/Button/Button'
import DocumentFilter from './DocumentFilter'

// DOM setup
let $, mount, root, scratch

const mockFields = {
  foo: {
    label: 'Foo',
    type: 'String'
  },
  bar: {
    label: 'Bar',
    type: 'Number'
  },
  baz: {
    label: 'Baz',
    type: 'String'
  }
}

options.debounceRendering = f => f()

beforeAll(() => {
  $ = sel => scratch.querySelectorAll(sel)
  mount = jsx => root = render(jsx, scratch, root)
  scratch = document.createElement('div')
})

afterEach(() => {
  mount(null).remove()
})

describe('DocumentFilter component', () => {
  it('has propTypes', () => {
    const component = (
      <DocumentFilter />
    )

    expect(component.nodeName.propTypes).to.exist
    expect(Object.keys(component.nodeName.propTypes)).to.have.length.above(0)
  })

  it('should return `null` if required fields are not defined', () => {
    const componentWithNoParams = (
      <DocumentFilter />
    )

    const componentWithNoField = (
      <DocumentFilter
        type={'$eq'}
        filters={[]}
        fields={mockFields}
      />
    )

    const componentWithNoFields = (
      <DocumentFilter
        type={'$eq'}
        filters={[]}
        fields={mockFields}
      />
    )

    const componentWithNoType = (
      <DocumentFilter
        field={'foo'}
        filters={[]}
        fields={mockFields}
      />
    )

    const componentWithNoFilters = (
      <DocumentFilter
        field={'foo'}
        type={'$eq'}
        fields={mockFields}
      />
    )

    mount(componentWithNoParams)
    expect(componentWithNoParams).to.equal(null)

    mount(componentWithNoField)
    expect(componentWithNoField).to.equal(null)

    mount(componentWithNoFields)
    expect(componentWithNoFields).to.equal(null)

    mount(componentWithNoType)
    expect(componentWithNoType).to.equal(null)

    mount(componentWithNoFilters)
    expect(componentWithNoFilters).to.equal(null)
  })

  it('renders a `div` with class `filter`', () => {
    const component = (
      <DocumentFilter
        field={'foo'}
        type={'$eq'}
        filters={[]}
        fields={mockFields}
      />
    )

    mount(component)

    expect(component).not.to.equal(null)
    expect($('.filter').length).to.equal(1)
    expect($('.control').length).to.equal(2)
  })

  it('renders a `<select>` node containing an entry for each field', () => {
    const component = (
      <DocumentFilter
        field={'foo'}
        type={'$eq'}
        filters={[]}
        fields={mockFields}
      />
    )

    mount(component)
    expect($('option').length).to.equal(Object.keys(mockFields).length + 1)
    expect($('option')[1].textContent).to.equal(mockFields.foo.label)
    expect($('option')[2].textContent).to.equal(mockFields.bar.label)
    expect($('option')[3].textContent).to.equal(mockFields.baz.label)
  })

  it('does not render a `FieldFilter` when existing filters are not defined', () => {
    const component = (
      <DocumentFilter
        field={'foo'}
        type={'$eq'}
        filters={[]}
        fields={mockFields}
      />
    )

    mount(component)
    expect($('.filter-container').length).to.equal(0)
  })

  it('renders a `FieldFilter` when existing filters are defined', () => {
    const mockFilters = [
    {
      field: "foo", 
      value: "qux",
      type: "$eq"
    }]

    const component = (
      <DocumentFilter
        field={'foo'}
        type={'$eq'}
        filters={mockFilters}
        fields={mockFields}
        index={0}
      />
    )

    mount(component)

    expect($('.filter-container').length).to.equal(1)
  })
})