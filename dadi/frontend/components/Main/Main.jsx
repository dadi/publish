import { h, Component } from 'preact'

import styles from './Main.css'
import normalize from './Normalize.css'

export default class Main extends Component {
  render () {
    return (
      <main className={styles.main}>
        {this.props.children}
      </main>
    )
  }
}
