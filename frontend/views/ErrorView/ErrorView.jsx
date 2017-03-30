import {Component, h} from 'preact'
import {connect} from 'preact-redux'
import {bindActionCreators} from 'redux'
import {connectHelper} from 'lib/util'

import Header from 'containers/Header/Header'
import HeroMessage from 'components/HeroMessage/HeroMessage'
import Main from 'components/Main/Main'
import Page from 'components/Page/Page'

class Error extends Component {
  render() {
    const {type} = this.props

    return (
      <Page>
        <Header />

        <Main>
          <HeroMessage
            title={type}
            subtitle="Oops! Something went wrong, sorry."
          />
        </Main>
      </Page>
    ) 
  }
}

export default connectHelper(
  state => state,
  dispatch => bindActionCreators({}, dispatch)
)(Error)
