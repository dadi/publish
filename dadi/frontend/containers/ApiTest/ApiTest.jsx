import { h, Component } from 'preact'
import { connect } from 'preact-redux'
import { bindActionCreators } from 'redux'

import * as testActions from '../../actions/testActions'

import CtaButton from '../../components/CtaButton/CtaButton'
// const localApiBridge = require('./../../lib/local-api-bridge-client')

class ApiTest extends Component {
  constructor(props) {
    super(props)
    // this._api = new localApiBridge()
  }

  render() {
    return (
      <CtaButton onClick={this._find.bind(this)}>Click me</CtaButton>
    )
  }

  _find() {
  //   this._api.find({
  //     env: 'remote',
  //     collection: 'users'
  //   }).whereFieldExists('name').find()
  }
}

function mapStateToProps(state) {
  return {
    state
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(testActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ApiTest)
