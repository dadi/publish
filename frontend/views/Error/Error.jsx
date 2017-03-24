import {Component, h} from 'preact'
import {connect} from 'preact-redux'
import {bindActionCreators} from 'redux'
import {connectHelper} from 'lib/util'

import HeroMessage from 'components/HeroMessage/HeroMessage'

class Error extends Component {
  render() {
    const {type} = this.props

    return (
      <HeroMessage
        title={type}
        subtitle="Oops! Something went wrong, sorry."
      />
    )
  }
}

export default connectHelper(
  state => state,
  dispatch => bindActionCreators({}, dispatch)
)(Error)
