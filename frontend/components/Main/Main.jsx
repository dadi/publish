import {Component, h} from 'preact'
import proptypes from 'proptypes'

import styles from './Main.css'
import normalize from './Normalize.css'

/**
 * The main content body element.
 */
export default class Main extends Component {
  render() {
    return (
      <main className={styles.main}>
        {this.props.children}
      </main>
    )
  }
}
