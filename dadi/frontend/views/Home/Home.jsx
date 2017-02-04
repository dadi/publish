import { h, Component } from 'preact'
import { connect } from 'preact-redux'
import { bindActionCreators } from 'redux'
import { connectHelper } from '../../lib/util'

import ApiTest from '../../containers/ApiTest/ApiTest'

import Logo from '../../components/Logo/Logo'
import Main from '../../components/Main/Main'
import Nav from '../../components/Nav/Nav'
import SubmitButton from '../../components/SubmitButton/SubmitButton'
import TextInput from '../../components/TextInput/TextInput'

const apiBridge = require('./../../lib/api-bridge-client')

class Home extends Component {
  render() {
    return (
      <Main>
        <Nav />
        <Logo />
        <ApiTest />
      </Main>
    )
  }
}

export default connectHelper(
  state => state,
  dispatch => bindActionCreators({}, dispatch)
)(Home)
