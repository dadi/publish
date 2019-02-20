'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './BulkActionSelector.css'

import ButtonWithPrompt from 'components/ButtonWithPrompt/ButtonWithPrompt'
import DropdownNative from 'components/DropdownNative/DropdownNative'

const ACTION_PLACEHOLDER = 'ACTION_PLACEHOLDER'

/**
 * A dropdown + button to apply actions to a series of elements.
 */
export default class BulkActionSelector extends Component {
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

    this.state.selected = ACTION_PLACEHOLDER
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
    const {
      actions,
      className,
      onChange,
      selection = []
    } = this.props
    const {selected} = this.state
    const containerStyle = new Style(styles, 'container')
      .addIf('container-empty', selection.length === 0)
      .addResolved(className)
    const placeholder = 'Bulk actions'
    let modifiedActions = {}
    let disableApplyButton = false

    // Generate new actions object for the dropdown options
    Object.keys(actions).forEach(key => {
      let label = actions[key].label
      
      label += actions[key].requireSelection && selection.length > 0 ?
        ` (${selection.length})` :
        ''
      
      modifiedActions[key] = label
    })

    // Determine enabled state of the Apply button
    if (actions[this.state.selected]) {
      disableApplyButton = actions[this.state.selected].requireSelection && selection.length === 0
    }

    return (
      <div class={containerStyle.getClasses()}>
        <DropdownNative
          className={styles.dropdown}
          onChange={this.onChange.bind(this)}
          options={modifiedActions}
          placeholderLabel={placeholder}
          placeholderValue={ACTION_PLACEHOLDER}
          textSize="small"
          value={selected}
        />

        <ButtonWithPrompt
          accent="data"
          disabled={(selected === ACTION_PLACEHOLDER) || disableApplyButton}
          onClick={this.onApply.bind(this)}
          promptCallToAction={`Yes, delete ${selection.length > 1 ? 'them' : 'it'}.`}
          promptMessage={`Are you sure you want to delete the selected ${selection.length > 1 ? 'documents' : 'document'}?`}
          size="small"
        >Apply</ButtonWithPrompt>
      </div>
    )
  }
}
