import { h, Component } from 'preact'

import CollectionNav from 'containers/CollectionNav/CollectionNav'

import { Style } from 'lib/util'
import styles from './Nav.css'

export default class Nav extends Component {
  render() {
    const { apis } = this.props

    return (
      <nav class={styles.nav}>
        <CollectionNav />
      </nav>
    )
  }
}