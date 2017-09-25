import {h, options, render} from 'preact'
import {expect} from 'chai'

jest.mock('./../../lib/util', () => ({
  getUniqueId: () => 'c-1'
}))

import FieldBooleanEdit from './FieldBooleanEdit'

import Checkbox from './../Checkbox/Checkbox'
import Label from './../Label/Label'

// DOM setup
let $, mount, root, scratch

options.debounceRendering = f => f()

beforeAll(() => {
  $ = sel => scratch.querySelectorAll(sel)
  mount = jsx => root = render(jsx, scratch, root)
  scratch = document.createElement('div')
})

beforeEach(() => {
  document.body.appendChild(scratch)
})

afterEach(() => {
  mount(null).remove()

  document.body.removeChild(document.body.firstChild)
})

const mockSchema = {
  _id: 'indexed',
  type: 'Boolean',
  label: 'Indexed by search engines',
  required: true,
  publish: {
    section: 'Meta',
    placement: 'sidebar',
    display: {
      list: false,
      edit: true
    }
  }
}

describe('FieldBooleanEdit component', () => {
  it('has propTypes', () => {
    const component = (
      <FieldBooleanEdit />
    )

    expect(component.nodeName.propTypes).to.exist
    expect(Object.keys(component.nodeName.propTypes)).to.have.length.above(0)
  })

  it('renders a Label and a Checkbox', () => {
    const component = (
      <FieldBooleanEdit
        schema={mockSchema}
        value={true}
      />
    )

    expect(component).to.contain(
      <Label
        compact={true}
        label={mockSchema.label}
      >
        <Checkbox
          onChange={() => {}}
          value={true}
        />
      </Label>
    )
  })

  it('renders an unchecked checkbox if the `value` prop is missing', () => {
    mount(
      <FieldBooleanEdit
        schema={mockSchema}
      />
    )

    expect($('input')[0].checked).to.eql(false)
  })

  it('toggles the checkbox value when clicking on the label', () => {
    mount(
      <FieldBooleanEdit
        schema={mockSchema}
        value={true}
      />
    )

    expect($('input')[0].checked).to.eql(true)

    $('label')[0].click()

    expect($('input')[0].checked).to.eql(false)
  })

  it('fires the `onChange` prop with the name of the field and the new value', () => {
    const callback = jest.fn()

    mount(
      <FieldBooleanEdit
        onChange={callback}
        schema={mockSchema}
        value={true}
      />
    )

    $('label')[0].click()

    expect(callback.mock.calls.length).to.eql(1)
    expect(callback.mock.calls[0][0]).to.eql(mockSchema._id)
    expect(callback.mock.calls[0][1]).to.eql(false)
  })
})
