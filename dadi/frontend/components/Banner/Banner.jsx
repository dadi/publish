'use strict'

import {h, Component} from 'preact'

import Style from 'lib/Style'
import styles from './Banner.css'

export default class Banner extends Component {
  static defaultProps = {
    accent: 'error'
  }

  render() {
    let bannerClass = new Style(styles, 'banner')

    bannerClass.add(`banner-${this.props.accent}`)

    return (
      <p class={bannerClass.getClasses()}>
        {this.props.children}
      </p>
    )
  }
}
