import { h, Component } from 'preact'
import { connect } from 'preact-redux'
import { bindActionCreators } from 'redux'
import { connectHelper } from '../../lib/util'
/*
* Components
 */
import Main from '../../components/Main/Main'

class MediaLibrary extends Component {
  render() {
    return (
      <Main>
          <h1>Media Library</h1>
      </Main>
    )
  }
}

export default connectHelper(
  state => state,
  dispatch => bindActionCreators({}, dispatch)
)(MediaLibrary)