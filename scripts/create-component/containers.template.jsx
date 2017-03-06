import {h, Component} from 'preact'
import {connect} from 'preact-redux'
import {bindActionCreators} from 'redux'
import {connectHelper} from 'lib/util'

class {NAME} extends Component {
  render() {
    const { type } = this.props

    return (
      <p>{NAME}</p>
    )
  }
}

export default connectHelper(
  state => state,
  dispatch => bindActionCreators({}, dispatch)
)({NAME})
