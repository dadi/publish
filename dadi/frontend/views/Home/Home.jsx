import { h, Component } from 'preact'
import { connect } from 'preact-redux'
import { bindActionCreators } from 'redux'
import { connectHelper } from 'lib/util'
/*
* Components
 */
import Logo from 'components/Logo/Logo'
import Main from 'components/Main/Main'
import Nav from 'components/Nav/Nav'
/*
* Actions
 */
import * as apiActions from 'actions/apiActions'

class Home extends Component {
  render() {
    const { state } = this.props
    return (
      <Main>
        <Nav apis={ state.apis } />
        <Logo />
      </Main>
    )
  }
}

export default connectHelper(
  state => state.api,
  dispatch => bindActionCreators(apiActions, dispatch)
)(Home)
