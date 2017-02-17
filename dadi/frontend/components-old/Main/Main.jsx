import { h, Component } from 'preact'

import styles from './Main.css'

export default class Main extends Component {
  render({ cinematic }) {
    return (
      <main className={styles.main}>
        {this.props.children}
      </main>
    )
  }
}
