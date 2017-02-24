import { h, Component } from 'preact'
import { connect } from 'preact-redux'
import { bindActionCreators } from 'redux'
import { connectHelper } from 'lib/util'

import Label from 'components/Label/Label'
import Nav from 'components/Nav/Nav'
import TextInput from 'components/TextInput/TextInput'

import * as apiActions from 'actions/apiActions'

class Home extends Component {
  render() {
    const { state } = this.props

    return (
      <div>
        <Label label="Title" comment="Optional">
          <TextInput/>
        </Label>
      </div>
    )
  }
}

export default connectHelper(
  state => state.api,
  dispatch => bindActionCreators(apiActions, dispatch)
)(Home)
