'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'
import Style from 'lib/Style'
import styles from './FieldMedia.css'

const fileSize = require('file-size')

export default class FieldMediaItem extends Component { 
  static propTypes = {
    /**
     * A subset of the app config containing data specific to this field type.
     */
    config: proptypes.object,

    /**
     * The field value.
     */
    value: proptypes.bool
  }

  constructor(props) {
    super(props)
  }

  getSource () {
    const {config, isList, value} = this.props
    const cdn = config ? config.cdn : null

    if (!value) return null

    let metaData = [
      value.fileName,
      `${value.contentLength ? '(' + fileSize(value.contentLength).human('si') + ')' : ''}`
    ]

    const style = new Style(styles, 'thumbnail')
      .addIf('list', isList)

    if (value.mimetype) {
      if (value.mimetype.indexOf('image') > -1) {
        let src = ''

        if (value._previewData) {
          src = value._previewData
        } else if (value.url) {
          src = value.url
        } else if (value.path) {
          if (cdn && cdn.publicUrl) {
            src = `${cdn.publicUrl}/${value.path}`
          } else {
            src = value.path
          }
        }

        return (
          <img class={style.getClasses()} src={src} title={metaData.join(' ')} />
        )
      } else {
        return (
          <span class={style.getClasses()}>{metaData.join(' ')}</span>
        )
      }
    }
  }

  render() {
    return this.getSource()
  }
}