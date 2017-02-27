import { h, Component } from 'preact'

import Nav from 'components/Nav/Nav'

import { Style } from 'lib/util'
import styles from './Header.css'

export default class Header extends Component {
  render() {
    const { apis } = this.props

    return (
      <header class={styles.header}>
        <div class={styles.masthead}>
          <img class={styles.logo} src="/images/publish.png" />
        </div>

        <Nav />
      </header>
    )
  }
}