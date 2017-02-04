import { h, Component } from 'preact'

import Styles from './Logo.scss'


export default class Logo extends Component {
  render() {
    return (
      <div class="Logo">
        <img alt="DADI Publish" src="/assets/img/logo.png" width="150"/>
      </div>
    )
  }
}
