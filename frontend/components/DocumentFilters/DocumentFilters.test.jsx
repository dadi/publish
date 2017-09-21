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

const mockInvalidFilters = {
  foo: {
    '$eq': null
  }
}

const mockValidFilters = {
  foo: {
    '$eq': 'bar'
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
      <DocumentFilters />
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
    expect($('form.filters').length).to.equal(1)
  })

  it('should not render `Apply` button if there are no valid filters present', () => {
    const component = (
      <DocumentFilters
        collection={mockCollection}
      />
    )

    mount(component)

    expect(component).not.to.equal(null)
    expect($('button.submit').length).to.equal(0)
  })

  it('should render `Apply` button if one or more filters are present', () => {
    let component

    mount(
      <DocumentFilters
        collection={mockCollection}
        filters={mockValidFilters}
        ref={c => component = c}
      />
    )

    expect($('button.submit').length).to.equal(1)
  })

  it('should mount with `dirty` state set to false', () => {
    let component

    mount(
      <DocumentFilters
        collection={mockCollection}
        filters={mockValidFilters}
        ref={c => component = c}
      />
    )

    expect(component.state.dirty).to.equal(false)
  })

  it('should change component `dirty` state value from false to true if input value changes', () => {
    let component

    const wrapper = mount(
      <DocumentFilters
        collection={mockCollection}
        filters={mockValidFilters}
        ref={c => component = c}
      />
    )
    $('input.control.control-value')[0].focus()

    const keyup = new KeyboardEvent("keyup", {
        type: 'keyup',
        altKey: false,
        bubbles: true,
        cancelBubble: false,
        cancelable: true,
        charCode: 0,
        code: 'KeyS',
        composed: true,
        ctrlKey: false,
        key : "s",
        isTrusted: true,
        keyCode : 83
    })
    expect(component.state.dirty).to.equal(false)

    // Dispatch fake keystroke in value field
    $('input.control.control-value')[0].dispatchEvent(keyup)

    expect(component.state.dirty).to.equal(true)
  })
})