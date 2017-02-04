import { h, Component } from 'preact'

import Styles from './Main.scss'

export default class Main extends Component {
  render({ cinematic }) {
    return (
      <section class={cinematic ? 'Main cinematic' : 'Main'}>
        {this.props.children}
      </section>
    )
  }
}
