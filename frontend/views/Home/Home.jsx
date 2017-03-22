import {Component, h} from 'preact'
import {connect} from 'preact-redux'
import {bindActionCreators} from 'redux'
import {connectHelper} from 'lib/util'

import DateTime from 'components/DateTime/DateTime'

const fecha = require('fecha')

export default class Home extends Component {
  render() {
    const d = new Date(2015, 2, 10, 5, 30, 20)

    return (
      <DateTime date={d} />
    )
  }
}
