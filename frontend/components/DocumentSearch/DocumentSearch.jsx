'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import TextInput from 'components/TextInput/TextInput'

/**
 * A component to handle search on a document.
 */
export default class DocumentSearch extends Component {
  static propTypes = {
    /**
     * The classes to pass on to the `TextInput` component used to search.
     */
    className: proptypes.string,

    /**
     * The collection being affected by the list controller.
     */
    collection: proptypes.object
  }

  render() {
    const {className, collection} = this.props

    return (
      <TextInput
        className={className}
        onChange={this.handleSearchChange.bind(this)}
        placeholder={`Search in ${collection.name}...`}
        type="search"
      />
    )
  }

  handleSearchChange(event) {
    console.log(event.target.value)
  }
}
