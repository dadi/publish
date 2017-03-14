'use strict'

import {h, Component} from 'preact'

import Style from 'lib/Style'
import styles from './DocumentSearch.css'

import TextInput from 'components/TextInput/TextInput'

export default class DocumentSearch extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const {collection} = this.props

    return (
      <TextInput
        className={styles.search}
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
