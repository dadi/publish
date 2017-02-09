import { h, Component } from 'preact'
import { connect } from 'preact-redux'
import { bindActionCreators } from 'redux'
import { connectHelper } from '../../lib/util'

import Logo from '../../components/Logo/Logo'
import Main from '../../components/Main/Main'
import Nav from '../../components/Nav/Nav'

class Home extends Component {
  render() {
    return (
      <Main>
        <Nav />
        <Logo />
      </Main>
    )
  }
}

export default connectHelper(
  state => state,
  dispatch => bindActionCreators({}, dispatch)
)(Home)
