import {h, options, render} from 'preact'
import {expect} from 'chai'

import FieldNumberEdit from './FieldNumberEdit'

import Checkbox from 'components/Checkbox/Checkbox'
import Label from 'components/Label/Label'
import TextInput from 'components/TextInput/TextInput'

jest.mock('./../../lib/util', () => ({
  getUniqueId: () => 'c-1'
}))

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

const mockSchema = {
  _id: 'pages',
  type: 'Number',
  label: 'Number of pages',
  required: false,
  publish: {
    section: 'Article',
    placement: 'sidebar',
    display: {
      list: false,
      edit: true
    }
  }
}

describe('FieldNumberEdit component', () => {
  it('has propTypes', () => {
    const component = (
      <FieldNumberEdit />
    )

    expect(component.nodeName.propTypes).to.exist
    expect(Object.keys(component.nodeName.propTypes)).to.have.length.above(0)
  })

  describe('renders a Label', () => {
    it('with the text from the schema', () => {
      const component = (
        <FieldNumberEdit
          schema={mockSchema}
        />
      )

      expect(component).to.matchTemplate(
        <Label
          label={mockSchema.label}
        >(...)</Label>
      )
    })

    it('with a "Required" message if the field is required', () => {
      const mockSchemaWithRequired = {
        ...mockSchema,
        required: true
      }

      const component = (
        <FieldNumberEdit
          schema={mockSchemaWithRequired}
        />
      )

      expect(component).to.matchTemplate(
        <Label
          comment="Required"
          label={mockSchema.label}
        >(...)</Label>
      )
    })

    it('with an error message if the `error` prop is a string', () => {
      const component = (
        <FieldNumberEdit
          error="Something went wrong"
          schema={mockSchema}
        />
      )

      expect(component).to.matchTemplate(
        <Label
          error={true}
          errorMessage="Something went wrong"
          label={mockSchema.label}
        >(...)</Label>
      )
    })
  })

  describe('renders a TextInput', () => {
    it('with type="number"', () => {
      const component = (
        <FieldNumberEdit
          schema={mockSchema}
        />
      )

      expect(component).to.contain(
        <TextInput
          id="c-1"
          inLabel={true}
          onChange={() => {}}
          readonly={false}
          type="number"
        />
      )
    })

    it('with the value passed in the `value` prop', () => {
      const component = (
        <FieldNumberEdit
          schema={mockSchema}
          value={1337}
        />
      )

      expect(component).to.contain(
        <TextInput
          id="c-1"
          inLabel={true}
          onChange={() => {}}
          readonly={false}
          type="number"
          value={1337}
        />
      )
    })

    it('with the `readonly` set if the field is set to read-only in the schema', () => {
      const mockSchemaReadOnly = {
        ...mockSchema,
        publish: {
          ...mockSchema.publish,
          readonly: true
        }
      }

      const component = (
        <FieldNumberEdit
          schema={mockSchemaReadOnly}
          value={1337}
        />
      )

      expect(component).to.contain(
        <TextInput
          id="c-1"
          inLabel={true}
          onChange={() => {}}
          readonly={true}
          type="number"
          value={1337}
        />
      )
    })
  })

  it('fires the `onChange` callback when the value of the field changes', () => {
    const onChange = jest.fn()

    mount(
      <FieldNumberEdit
        onChange={onChange}
        schema={mockSchema}
        value={1337}
      />
    )

    const $input = $('input[type="number"]')[0]

    $input.value = 42

    $input.dispatchEvent(new Event('change'))

    expect(onChange.mock.calls.length).to.eql(1)
    expect(onChange.mock.calls[0][0]).to.eql(mockSchema._id)
    expect(onChange.mock.calls[0][1]).to.eql(42)
  })
})
