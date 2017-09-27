import {h, options, render} from 'preact'
import {expect} from 'chai'

import FieldPassword from './FieldPassword'
import FieldPasswordEdit from './FieldPasswordEdit'

import * as Constants from 'lib/constants'
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
  _id: 'password',
  type: 'String',
  label: 'Password',
  comments: 'Your password',
  example: 'My Pass',
  required: true,
  message: 'can\'t be empty',
  publish: {
    subType: 'Password',
    section: 'Password reset',
    placement: 'main',
    display: {
      list: false,
      edit: true
    }
  }
}

describe('FieldPasswordEdit component', () => {
  it('has propTypes', () => {
    const component = (
      <FieldPasswordEdit />
    )

    expect(component.nodeName.propTypes).to.exist
    expect(Object.keys(component.nodeName.propTypes)).to.have.length.above(0)
  })

  describe('current password', () => {
    it('renders a Label and a TextInput for the current password', () => {
      const component = (
        <FieldPasswordEdit
          schema={mockSchema}
        />
      )

      expect(component).to.contain(
        <Label
          className="label"
          label={`Current ${mockSchema.label.toLowerCase()}`}
        >
          <TextInput
            placeholder={mockSchema.placeholder}
            type="password"
            value=""
          />
        </Label>
      )
    })

    it('renders an error message if the current password is incorrect', () => {
      const component = (
        <FieldPasswordEdit
          error={[Constants.ERROR_WRONG_PASSWORD]}
          schema={mockSchema}
        />
      )

      expect(component).to.contain(
        <Label
          className="label"
          error={true}
          errorMessage="This password is incorrect"
          label={`Current ${mockSchema.label.toLowerCase()}`}
        >
          <TextInput
            placeholder={mockSchema.placeholder}
            type="password"
            value=""
          />
        </Label>
      )
    })

    it('flags an error if the `error` prop contains the `ERROR_MISSING_FIELDS` constant and the field is empty', () => {
      const component = (
        <FieldPasswordEdit
          error={[Constants.ERROR_MISSING_FIELDS]}
          schema={mockSchema}
        />
      )

      expect(component).to.contain(
        <Label
          className="label"
          error={true}
          label={`Current ${mockSchema.label.toLowerCase()}`}
        >
          <TextInput
            placeholder={mockSchema.placeholder}
            type="password"
            value=""
          />
        </Label>
      )
    })

    it('triggers validation when a key is pressed', () => {
      let component

      mount(
        <FieldPasswordEdit
          ref={c => component = c}
          schema={mockSchema}
        />
      )

      const validateFn = jest.spyOn(component, 'validate')

      component.handleKeyUp('currentPassword', {
        target: {
          value: 'My password 1234'
        }
      })

      expect(validateFn.mock.calls.length).to.eql(1)
    })

    it('triggers validation when the value changes', () => {
      let component

      mount(
        <FieldPasswordEdit
          ref={c => component = c}
          schema={mockSchema}
        />
      )

      const validateFn = jest.spyOn(component, 'validate')

      component.handleOnChange('currentPassword', {
        target: {
          value: 'My password 1234'
        }
      })

      expect(validateFn.mock.calls.length).to.eql(1)
    })

    it('updates the field value when a key is pressed and, if the `ERROR_WRONG_PASSWORD` is present, requests to remove validation errors via the `onError` callback', () => {
      const newValue = 'My password 1234'
      const onError = jest.fn()

      let component

      mount(
        <FieldPasswordEdit
          error={[Constants.ERROR_WRONG_PASSWORD]}
          onError={onError}
          ref={c => component = c}
          schema={mockSchema}
        />
      )

      component.handleKeyUp('currentPassword', {
        target: {
          value: newValue
        }
      })

      const removeValidationCall = onError.mock.calls.pop()

      expect(removeValidationCall[0]).to.eql(mockSchema._id)
      expect(removeValidationCall[1]).to.eql(false)
      expect(removeValidationCall[2]).to.eql('')

      expect($('input[type="password"]')[0].value).to.eql(newValue)
    })
  })

  describe('new password', () => {
    it('renders a Label and a TextInput for the new password', () => {
      const component = (
        <FieldPasswordEdit
          schema={mockSchema}
        />
      )

      expect(component).to.contain(
        <Label
          className="label"
          label={`New ${mockSchema.label.toLowerCase()}`}
        >
          <TextInput
            placeholder={mockSchema.placeholder}
            type="password"
            value=""
          />
        </Label>
      )
    })

    it('flags an error if the `error` prop contains the `ERROR_MISSING_FIELDS` constant and the field is empty', () => {
      const component = (
        <FieldPasswordEdit
          error={[Constants.ERROR_MISSING_FIELDS]}
          schema={mockSchema}
        />
      )

      expect(component).to.contain(
        <Label
          className="label"
          error={true}
          label={`New ${mockSchema.label.toLowerCase()}`}
        >
          <TextInput
            placeholder={mockSchema.placeholder}
            type="password"
            value=""
          />
        </Label>
      )
    })

    it('triggers validation when a key is pressed', () => {
      let component

      mount(
        <FieldPasswordEdit
          ref={c => component = c}
          schema={mockSchema}
        />
      )

      const validateFn = jest.spyOn(component, 'validate')

      component.handleKeyUp('newPassword', {
        target: {
          value: 'My password 1234'
        }
      })

      expect(validateFn.mock.calls.length).to.eql(1)
    })

    it('triggers validation when the value changes', () => {
      let component

      mount(
        <FieldPasswordEdit
          ref={c => component = c}
          schema={mockSchema}
        />
      )

      const validateFn = jest.spyOn(component, 'validate')

      component.handleOnChange('newPassword', {
        target: {
          value: 'My password 1234'
        }
      })

      expect(validateFn.mock.calls.length).to.eql(1)
    })

    it('updates the field value when a key is pressed', () => {
      const newValue = 'My password 1234'

      let component

      mount(
        <FieldPasswordEdit
          ref={c => component = c}
          schema={mockSchema}
        />
      )

      component.handleKeyUp('newPassword', {
        target: {
          value: newValue
        }
      })

      expect($('input[type="password"]')[1].value).to.eql(newValue)
    })
  })

  describe('new password confirmation', () => {
    it('renders a Label and a TextInput for the new password confirmation', () => {
      const component = (
        <FieldPasswordEdit
          schema={mockSchema}
        />
      )

      expect(component).to.contain(
        <Label
          className="label"
          label={`New ${mockSchema.label.toLowerCase()} (confirm)`}
        >
          <TextInput
            placeholder={mockSchema.placeholder}
            type="password"
            value=""
          />
        </Label>
      )
    })

    it('renders an error message if the passwords do not match', () => {
      const component = (
        <FieldPasswordEdit
          error={[Constants.ERROR_PASSWORD_MISMATCH]}
          schema={mockSchema}
        />
      )

      expect(component).to.contain(
        <Label
          className="label"
          error={true}
          errorMessage="The passwords must match"
          label={`New ${mockSchema.label.toLowerCase()} (confirm)`}
        >
          <TextInput
            placeholder={mockSchema.placeholder}
            type="password"
            value=""
          />
        </Label>
      )
    })

    it('flags an error if the `error` prop contains the `ERROR_MISSING_FIELDS` constant and the field is empty', () => {
      const component = (
        <FieldPasswordEdit
          error={[Constants.ERROR_MISSING_FIELDS]}
          schema={mockSchema}
        />
      )

      expect(component).to.contain(
        <Label
          className="label"
          error={true}
          label={`New ${mockSchema.label.toLowerCase()} (confirm)`}
        >
          <TextInput
            placeholder={mockSchema.placeholder}
            type="password"
            value=""
          />
        </Label>
      )
    })

    it('triggers validation when a key is pressed', () => {
      let component

      mount(
        <FieldPasswordEdit
          ref={c => component = c}
          schema={mockSchema}
        />
      )

      const validateFn = jest.spyOn(component, 'validate')

      component.handleKeyUp('newPasswordConfirm', {
        target: {
          value: 'My password 1234'
        }
      })

      expect(validateFn.mock.calls.length).to.eql(1)
    })

    it('triggers validation when the value changes', () => {
      let component

      mount(
        <FieldPasswordEdit
          ref={c => component = c}
          schema={mockSchema}
        />
      )

      const validateFn = jest.spyOn(component, 'validate')

      component.handleOnChange('newPasswordConfirm', {
        target: {
          value: 'My password 1234'
        }
      })

      expect(validateFn.mock.calls.length).to.eql(1)
    })

    it('updates the field value when a key is pressed', () => {
      const newValue = 'My password 1234'

      let component

      mount(
        <FieldPasswordEdit
          ref={c => component = c}
          schema={mockSchema}
        />
      )

      component.handleKeyUp('newPasswordConfirm', {
        target: {
          value: newValue
        }
      })

      expect($('input[type="password"]')[2].value).to.eql(newValue)
    })
  })

  it('calls the `onChange` callback with a JSON string containing the current and new passwords when any value changes', () => {
    const onChange = jest.fn()

    let component

    mount(
      <FieldPasswordEdit
        onChange={onChange}
        ref={c => component = c}
        schema={mockSchema}
      />
    )

    component.handleKeyUp('currentPassword', {
      target: {
        value: 'Before'
      }
    })

    component.handleKeyUp('newPassword', {
      target: {
        value: 'After'
      }
    })

    component.handleOnChange('newPasswordConfirm')

    expect(onChange.mock.calls.length).to.eql(1)
    expect(onChange.mock.calls[0][0]).to.eql(mockSchema._id)
    expect(onChange.mock.calls[0][1]).to.eql(
      JSON.stringify({
        current: 'Before',
        new: 'After'
      })
    )
    expect(onChange.mock.calls[0][2]).to.eql(false)
  })

  describe('validation', () => {
    it('if `forceValidation` is falsy, it only triggers validation after one of the fields has been interacted with', () => {
      const onError = jest.fn()

      let component

      mount(
        <FieldPasswordEdit
          onError={onError}
          ref={c => component = c}
          schema={mockSchema}
        />
      )

      expect(onError.mock.calls.length).to.eql(0)

      component.handleKeyUp('currentPassword', {
        target: {
          value: 'M'
        }
      })

      expect(onError.mock.calls.length).to.eql(1)
    })

    it('if `forceValidation` is truthy, it triggers validation immediately', () => {
      const onError = jest.fn()

      let component

      mount(
        <FieldPasswordEdit
          forceValidation={true}
          onError={onError}
          ref={c => component = c}
          schema={mockSchema}
        />
      )

      expect(onError.mock.calls.length).to.eql(1)
    })

    it('fires `onError` with a ERROR_PASSWORD_MISMATCH error if the new password and its confirmation do not match', () => {
      const onError = jest.fn()

      let component

      mount(
        <FieldPasswordEdit
          onError={onError}
          ref={c => component = c}
          schema={mockSchema}
        />
      )

      component.handleKeyUp('currentPassword', {
        target: {
          value: 'iLoveCake'
        }
      })

      component.handleKeyUp('newPassword', {
        target: {
          value: 'iLoveCats'
        }
      })

      component.handleKeyUp('newPasswordConfirm', {
        target: {
          value: 'iLoveDogs'
        }
      })

      const lastCall = onError.mock.calls.pop()

      expect(lastCall[0]).to.eql(mockSchema._id)
      expect(lastCall[1]).to.include('ERROR_PASSWORD_MISMATCH')
      expect(lastCall[2]).to.eql('iLoveCats')
    })

    it('fires `onError` with a ERROR_MISSING_FIELDS error if the current password field is empty', () => {
      const onError = jest.fn()

      let component

      mount(
        <FieldPasswordEdit
          onError={onError}
          ref={c => component = c}
          schema={mockSchema}
        />
      )

      component.handleKeyUp('newPassword', {
        target: {
          value: 'iLoveCats'
        }
      })

      component.handleKeyUp('newPasswordConfirm', {
        target: {
          value: 'iLoveCats'
        }
      })

      const lastCall = onError.mock.calls.pop()

      expect(lastCall[0]).to.eql(mockSchema._id)
      expect(lastCall[1]).to.include('ERROR_MISSING_FIELDS')
      expect(lastCall[2]).to.eql('iLoveCats')
    })

    it('fires `onError` with a ERROR_MISSING_FIELDS error if the new password field is empty', () => {
      const onError = jest.fn()

      let component

      mount(
        <FieldPasswordEdit
          onError={onError}
          ref={c => component = c}
          schema={mockSchema}
        />
      )

      component.handleKeyUp('currentPassword', {
        target: {
          value: 'iLoveCake'
        }
      })

      component.handleKeyUp('newPasswordConfirm', {
        target: {
          value: 'iLoveCats'
        }
      })

      const lastCall = onError.mock.calls.pop()

      expect(lastCall[0]).to.eql(mockSchema._id)
      expect(lastCall[1]).to.include('ERROR_MISSING_FIELDS')
      expect(lastCall[2]).to.eql('')
    })

    it('fires `onError` with a ERROR_MISSING_FIELDS error if the new password confirmation field is empty', () => {
      const onError = jest.fn()

      let component

      mount(
        <FieldPasswordEdit
          onError={onError}
          ref={c => component = c}
          schema={mockSchema}
        />
      )

      component.handleKeyUp('currentPassword', {
        target: {
          value: 'iLoveCake'
        }
      })

      component.handleKeyUp('newPassword', {
        target: {
          value: 'iLoveCats'
        }
      })

      const lastCall = onError.mock.calls.pop()

      expect(lastCall[0]).to.eql(mockSchema._id)
      expect(lastCall[1]).to.include('ERROR_MISSING_FIELDS')
      expect(lastCall[2]).to.eql('iLoveCats')
    })
  })
})