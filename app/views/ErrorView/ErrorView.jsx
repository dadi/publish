import {connectRedux} from 'lib/redux'
import ErrorMessage from 'components/ErrorMessage/ErrorMessage'
import Header from 'containers/Header/Header'
import Main from 'components/Main/Main'
import Page from 'components/Page/Page'
import React from 'react'

class ErrorView extends React.Component {
  render() {
    const {data, state, type} = this.props
    const {currentCollection} = state.api
    const hasConfig = state.app && state.app.config

    // We only treat this as an actual error, and therefore display the error
    // message, if the config has already been loaded. This prevents us from
    // showing a flashing 404 page whilst routes are still being loaded.
    return (
      <Page>
        <Header
          currentCollection={currentCollection}
        />

        <Main>
          {(hasConfig || data) &&
            <ErrorMessage type={type} data={data} />
          }
        </Main>
      </Page>
    ) 
  }
}

export default connectRedux()(ErrorView)
