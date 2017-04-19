import {Component, h} from 'preact'
import {connect} from 'preact-redux'
import {bindActionCreators} from 'redux'
import {connectHelper} from 'lib/util'

import * as Constants from 'lib/constants'

import Button from 'components/Button/Button'
import Header from 'containers/Header/Header'
import HeroMessage from 'components/HeroMessage/HeroMessage'
import Main from 'components/Main/Main'
import Page from 'components/Page/Page'

class Error extends Component {
  render() {
    const {state} = this.props
    const hasConfig = state.app && state.app.config
    const errorData = this.getErrorData()

    // We only treat this as an actual error, and therefore display the error
    // message, if the config has already been loaded. This prevents us from
    // showing a flashing 404 page whilst routes are still being loaded.
    return (
      <Page>
        <Header />

        <Main>
          {hasConfig &&
            <HeroMessage
              title={errorData.title}
              subtitle={errorData.message}
            >
              {errorData.body || null}
            </HeroMessage>
          }
        </Main>
      </Page>
    ) 
  }

  getErrorData() {
    const {type} = this.props

    switch (type) {
      case '404':
        return {
          message: 'We couldn\'t find the page you\'re looking for, sorry.',
          title: '404'
        }

      case Constants.STATUS_FAILED:
        return {
          body: (
            <Button
              accent="system"
              href={window.location.pathname}
            >Try again</Button>
          ),
          message: 'The API doesn\'t seem to be responding.',
          title: 'API failure'
        }

      default:
        return {
          message: 'Something went wrong, sorry.',
          title: 'Oops!'
        }
    }
  }
}

export default connectHelper(
  state => state,
  dispatch => bindActionCreators({}, dispatch)
)(Error)
