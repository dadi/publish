'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './FieldPassword.css'

import Label from 'components/Label/Label'
import TextInput from 'components/TextInput/TextInput'

/**
 * Component for API fields of type Password
 */
export default class FieldPasswordEdit extends Component {
  static propTypes = {
    /**
     * The name of the collection being edited, as per the URL.
     */
    collection: proptypes.string,

    /**
     * A subset of the app config containing data specific to this field type.
     */
    config: proptypes.object,

    /**
     * The schema of the API being used.
     */
    currentApi: proptypes.object,

    /**
     * The schema of the collection being edited.
     */
    currentCollection: proptypes.object,

    /**
     * The ID of the document being edited.
     */
    documentId: proptypes.string,

    /**
     * If defined, contains an error message to be displayed by the field.
     */
    error: proptypes.string,

    /**
     * Whether the field should be validated as soon as it mounts, rather than
     * waiting for a change event.
     */
    forceValidation: proptypes.bool,

    /**
     * If defined, specifies a group where the current collection belongs.
     */
    group: proptypes.string,

    /**
     * A callback to be fired whenever the field wants to update its value to
     * a successful state. The function receives the name of the field and the
     * new value as arguments.
     */
    onChange: proptypes.string,

    /**
     * A callback to be fired whenever the field wants to update its value to
     * or from an error state. The function receives the name of the field, a
     * Boolean value indicating whether or not there's an error and finally the
     * new value of the field.
     */
    onError: proptypes.string,

    /**
     * The field schema.
     */
    schema: proptypes.object,

    /**
     * The field value.
     */
    value: proptypes.bool
  }

  static defaultProps = {
    error: false,
    forceValidation: false,
    value: ''
  }

  componentDidMount() {
    const {forceValidation, value} = this.props

    if (forceValidation) {
      this.validate(value)
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const {forceValidation, value} = this.props

    if (!prevProps.forceValidation && forceValidation) {
      this.validate(value)
    }
  }

  render() {
    const {error, schema} = this.props
    const publishBlock = schema.publish || {}

    return (
      <div>
        <Label
          className={styles.label}
          error={error}
          errorMessage={typeof error === 'string' ? error : null}
          label={`Current ${schema.label.toLowerCase()}`}
        >
          <TextInput
            onChange={this.handleOnChange.bind(this)}
            placeholder={schema.placeholder}
            type="password"
          />
        </Label>

        <Label
          className={styles.label}
          error={error}
          errorMessage={typeof error === 'string' ? error : null}
          label={`New ${schema.label.toLowerCase()}`}
        >
          <TextInput
            onChange={this.handleOnChange.bind(this)}
            onKeyUp={this.validate.bind(this)}
            placeholder={schema.placeholder}
            ref={element => this.newPasswordRef = element}
            type="password"
          />
        </Label>

        <Label
          className={styles.label}
          error={error}
          errorMessage={typeof error === 'string' ? error : null}
          label={`New ${schema.label.toLowerCase()} (confirm)`}
        >
          <TextInput
            onChange={this.handleOnChange.bind(this)}
            onKeyUp={this.validate.bind(this)}
            placeholder={schema.placeholder}
            ref={element => this.newPasswordConfirmRef = element}
            type="password"
          />
        </Label>
      </div>
    )
  }

  handleOnChange(event) {
    const {onChange, schema} = this.props
    const value = event.target.value

    this.validate(value)

    if (typeof onChange === 'function') {
      onChange.call(this, schema._id, value)
    }
  }

  validate() {
    //console.log('*** HI', this.newPasswordRef)
  }
}
