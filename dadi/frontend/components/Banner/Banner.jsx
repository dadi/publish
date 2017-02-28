'use strict'

import { h, Component } from 'preact'

import { Style } from 'lib/util'
import styles from './Banner.css'

export default class Banner extends Component {
  render () {
    const accent = this.props.accent || 'error'

    let bannerClass = new Style(styles)

    bannerClass.add('banner')
      .add(`banner-${accent}`)

    return (
      <p class={bannerClass.getClasses()}>
        {this.props.children}
      </p>
    )
  }
}
