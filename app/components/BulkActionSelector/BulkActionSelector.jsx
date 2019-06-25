import Button from 'components/Button/Button'
import ButtonWithPrompt from 'components/ButtonWithPrompt/ButtonWithPrompt'
import DropdownNative from 'components/DropdownNative/DropdownNative'
import proptypes from 'prop-types'
import React from 'react'
import Style from 'lib/Style'
import styles from './BulkActionSelector.css'

const ACTION_PLACEHOLDER = 'ACTION_PLACEHOLDER'

/**
 * A dropdown + button to apply actions to a series of elements.
 */
export default class BulkActionSelector extends React.Component {
  static propTypes = {
    /**
     * List of possible actions. Must be an object mapping action IDs
     * to action labels.
     */
    actions: proptypes.object,

    /**
     * Classes to append to the element.
     */
    className: proptypes.string,

    /**
     * Callback to be executed when a value is selected.
     */
    onChange: proptypes.func,

    /**
     * Array of selected elements.
     */
    selection: proptypes.array
  }

  constructor(props) {
    super(props)

    this.state = {
      selected: ACTION_PLACEHOLDER
    }
  }

  onApply() {
    const {onChange} = this.props
    const {selected} = this.state

    if (!selected || selected === ACTION_PLACEHOLDER) return

    if (typeof onChange === 'function') {
      onChange.call(this, selected)
    }
  }

  onChange(value) {
    this.setState({
      selected: value
    })
  }

  render() {
    const {actions, className, onChange, selection = []} = this.props
    const {selected} = this.state
    const containerStyle = new Style(styles, 'container')
      .addIf('container-empty', selection.length === 0)
      .addResolved(className)
    const placeholder = 'Bulk actions'

    // Generate new actions object for the dropdown options
    const modifiedActions = {}

    Object.keys(actions).forEach(key => {
      modifiedActions[key] = actions[key].label
    })

    // If the option comes with a confirmation message, display
    // ButtonWithPrompt, otherwise a standard Button is used.
    const needsButtonWithPrompt =
      selected !== ACTION_PLACEHOLDER && actions[selected].ctaMessage

    return (
      <div className={containerStyle.getClasses()}>
        <DropdownNative
          className={styles.dropdown}
          onChange={this.onChange.bind(this)}
          options={modifiedActions}
          placeholderLabel={placeholder}
          placeholderValue={ACTION_PLACEHOLDER}
          textSize="small"
          value={selected}
        />

        {needsButtonWithPrompt && (
          <ButtonWithPrompt
            accent="data"
            disabled={
              selected === ACTION_PLACEHOLDER || actions[selected].disabled
            }
            onClick={this.onApply.bind(this)}
            promptCallToAction={actions[selected].ctaMessage}
            promptMessage={actions[selected].confirmationMessage}
            size="small"
          >
            Apply
          </ButtonWithPrompt>
        )}

        {!needsButtonWithPrompt && (
          <Button
            accent="data"
            disabled={selected === ACTION_PLACEHOLDER}
            onClick={this.onApply.bind(this)}
            size="small"
          >
            Apply
          </Button>
        )}
      </div>
    )
  }
}
