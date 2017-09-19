import {h, options, render} from 'preact'
import {expect} from 'chai'

import DocumentFilters from './DocumentFilters'

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

const mockCollection = {
  fields: mockFields
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

describe('DocumentFilters component', () => {
  it('has propTypes', () => {
    const component = (
      <DocumentFilters />
    )

    expect(component.nodeName.propTypes).to.exist
    expect(Object.keys(component.nodeName.propTypes)).to.have.length.above(0)
  })

  it('should return `null` if required fields are not defined', () => {
    const componentWithNoParams = (
      <DocumentFilters
      />
    )

    const componentWithNoCollection = (
      <DocumentFilters
        filters={[]}
      />
    )

    mount(componentWithNoParams)
    mount(componentWithNoCollection)

    expect(componentWithNoParams).to.equal(null)
    expect(componentWithNoCollection).to.equal(null)
  })

  it('renders a `form` with class `filters`', () => {
    const component = (
      <DocumentFilters
        collection={mockCollection}
      />
    )

    mount(component)

    expect(component).not.to.equal(null)
    expect($('form.filters')).to.exist
  })
})