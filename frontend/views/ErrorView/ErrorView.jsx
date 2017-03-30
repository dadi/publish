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
    const {state, type} = this.props
    const hasConfig = state.app && state.app.config

    // We only treat this as an actual error, and therefore display the error
    // message, if the config has already been loaded. This prevents us from
    // showing a flashing 404 page whilst routes are still being loaded.
    return (
      <Page>
        <Header />

        <Main>
          {hasConfig &&
            <HeroMessage
              title={type}
              subtitle="Oops! Something went wrong, sorry."
            />
          }
        </Main>
      </Page>
    ) 
  }
}

export default connectHelper(
  state => state,
  dispatch => bindActionCreators({}, dispatch)
)(Error)
