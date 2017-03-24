import {Component, h} from 'preact'
import {connect} from 'preact-redux'
import {bindActionCreators} from 'redux'
import {connectHelper} from 'lib/util'

class MediaLibrary extends Component {
  render() {
    return (
      <h1>Media Library</h1>
    )
  }
}

export default connectHelper(
  state => state,
  dispatch => bindActionCreators({}, dispatch)
)(MediaLibrary)
