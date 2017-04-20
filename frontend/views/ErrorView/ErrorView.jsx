import {Component, h} from 'preact'
import {connect} from 'preact-redux'
import {bindActionCreators} from 'redux'
import {connectHelper} from 'lib/util'

import Header from 'containers/Header/Header'
import ErrorMessage from 'components/ErrorMessage/ErrorMessage'
import Main from 'components/Main/Main'
import Page from 'components/Page/Page'

class ErrorView extends Component {
  render() {
    const {state, type} = this.props
    const hasConfig = state.app && state.app.config
console.log('*** HI!')    
    // We only treat this as an actual error, and therefore display the error
    // message, if the config has already been loaded. This prevents us from
    // showing a flashing 404 page whilst routes are still being loaded.
    return (
      <Page>
        <Header />

        <Main>
          {hasConfig &&
            <ErrorMessage type={type}/>
          }
        </Main>
      </Page>
    ) 
  }

  
}

export default connectHelper(
  state => state,
  dispatch => bindActionCreators({}, dispatch)
)(ErrorView)
