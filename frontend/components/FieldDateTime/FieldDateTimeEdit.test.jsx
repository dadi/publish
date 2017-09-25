import {h, options, render} from 'preact'
import {expect} from 'chai'

import FieldDateTimeEdit from './FieldDateTimeEdit'

import DateTime from './../../lib/datetime'
import DateTimePicker from './../DateTimePicker/DateTimePicker'
import Label from './../Label/Label'
import TextInput from './../TextInput/TextInput'

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

beforeEach(() => {
  document.body.appendChild(scratch)
})

afterEach(() => {
  mount(null).remove()

  document.body.removeChild(document.body.firstChild)
})

const mockConfig = {
  formats: {
    date: {
      long: 'YYYY/MM/DD HH:mm'
    }
  }
}

const mockSchema = {
  _id: 'publishDate',
  type: 'DateTime',
  label: 'Publish date',
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

describe('FieldDateTimeEdit component', () => {
  it('has propTypes', () => {
    const component = (
      <FieldDateTimeEdit />
    )

    expect(component.nodeName.propTypes).to.exist
    expect(Object.keys(component.nodeName.propTypes)).to.have.length.above(0)
  })

  describe('renders a Label component', () => {
    it('with a TextInput component inside', () => {
      const component = (
        <FieldDateTimeEdit
          error="Something went wrong"
          schema={mockSchema}
        />
      )

      expect(component).to.contain(
        <Label
          error={true}
          errorMessage="Something went wrong"
          label={mockSchema.label}
        >
          <TextInput
            type="text"
          />
        </Label>
      )
    })

    it('displays a "Required" message if the field is required', () => {
      const mockSchemaRequired = Object.assign({}, mockSchema, {
        required: true
      })
      const component = (
        <FieldDateTimeEdit
          error="Something went wrong"
          schema={mockSchemaRequired}
        />
      )

      expect(component).to.contain(
        <Label
          error={true}
          errorMessage="Something went wrong"
          label={mockSchema.label}
          comment="Required"
        >
          <TextInput
            type="text"
          />
        </Label>
      )
    })
  })

  describe('accepts a date passed in the `value` prop', () => {
    it('displays the formatted date, if valid, according to the format defined in config', () => {
      const mockDate = new Date()
      const mockDateFormat = mockConfig.formats.date.long
      const mockDateTime = new DateTime(mockDate.getTime(), mockDateFormat)
      const component = (
        <FieldDateTimeEdit
          config={mockConfig}
          schema={mockSchema}
          value={mockDate.getTime()}
        />
      )

      expect(component).to.contain(
        <TextInput
          id="c-1"
          inLabel={true}
          type="text"
          value={mockDateTime.format(mockDateFormat)}
        />
      )
    })

    it('does not display a value if the given date is not valid', () => {
      const mockDate = 'notADate'
      const mockDateFormat = mockConfig.formats.date.long
      const mockDateTime = new DateTime(mockDate, mockDateFormat)
      const component = (
        <FieldDateTimeEdit
          config={mockConfig}
          schema={mockSchema}
          value={mockDate}
        />
      )

      expect(component).to.contain(
        <TextInput
          id="c-1"
          inLabel={true}
          type="text"
        />
      )
    })
  })

  it('removes the click event listener on unmount', () => {
    let component

    mount(
      <FieldDateTimeEdit
        config={mockConfig}
        ref={c => component = c}
        schema={mockSchema}
      />
    )

    const eventListenerFn = component.pickerOutsideEventHandler
    const mockRemoveEventListener = jest.fn()

    $('input[type="text"]')[0].focus()

    component.picker.removeEventListener = mockRemoveEventListener

    mount(null).remove()

    expect(mockRemoveEventListener.mock.calls.length).to.eql(1)
    expect(mockRemoveEventListener.mock.calls[0][0]).to.eql('click')
    expect(mockRemoveEventListener.mock.calls[0][1].toString()).to.eql(eventListenerFn.toString())
  })

  describe('a DateTimePicker component', () => {
    const mockDate = new Date()

    it('is hidden when the component is mounted and whenever TextInput loses focus', done => {
      mount(
        <FieldDateTimeEdit
          config={mockConfig}
          schema={mockSchema}
          value={mockDate}
        />
      )

      expect($('.picker').length).to.equal(0)

      $('input[type="text"]')[0].focus()
      $('input[type="text"]')[0].blur()

      setTimeout(() => {
        expect($('.picker').length).to.equal(0)

        done() 
      }, 300)
    })

    it('is shown when the TextInput gains focus', () => {
      mount(
        <FieldDateTimeEdit
          config={mockConfig}
          schema={mockSchema}
          value={mockDate}
        />
      )

      expect($('.picker').length).to.equal(0)

      $('input[type="text"]')[0].focus()

      expect($('.picker').length).to.equal(1)
    })

    it('is hidden when clicking outside it', done => {
      mount(
        <div>
          <FieldDateTimeEdit
            config={mockConfig}
            schema={mockSchema}
            value={mockDate}
          />
          <button class="neighbour" type="button">Click me</button>
        </div>
      )

      $('input[type="text"]')[0].focus()

      expect($('.picker').length).to.equal(1)

      $('.neighbour')[0].focus()
      $('.neighbour')[0].click()

      setTimeout(() => {
        expect($('.picker').length).to.equal(0)

        done()
      }, 200)
    })

    it('is not hidden when clicking inside it', done => {
      mount(
        <FieldDateTimeEdit
          config={mockConfig}
          schema={mockSchema}
          value={mockDate}
        />
      )

      $('input[type="text"]')[0].focus()

      expect($('.picker').length).to.equal(1)

      $('button')[0].focus()
      $('button')[0].click()

      setTimeout(() => {
        expect($('.picker').length).to.equal(1)

        done()
      }, 200)
    })    

    it('fires the callback in the `onChange` prop when the TextInput value changes', () => {
      const callback = jest.fn()
      const mockDateFormat = mockConfig.formats.date.long
      const mockDate = new Date(2017, 11, 28, 8)
      const mockDateTime = new DateTime(mockDate.getTime(), mockDateFormat)
      const mockNewDate = new Date(2017, 7, 31, 5)
      const mockNewDateTime = new DateTime(mockNewDate.getTime(), mockDateFormat)

      mount(
        <FieldDateTimeEdit
          config={mockConfig}
          onChange={callback}
          schema={mockSchema}
          value={mockDate}
        />
      )

      const $input = $('input[type="text"]')[0]

      $input.focus()
      $input.value = mockNewDateTime.format(mockDateFormat)
      $input.dispatchEvent(new Event('change', {
        type: 'change'
      }))

      expect(callback.mock.calls.length).to.eql(1)
      expect(callback.mock.calls[0][0]).to.eql(mockSchema._id)
      expect(callback.mock.calls[0][1]).to.eql(mockNewDate.toISOString())
    })    
  })
})
