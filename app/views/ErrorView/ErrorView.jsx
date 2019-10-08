import {connectRedux} from 'lib/redux'
import ErrorMessage from 'components/ErrorMessage/ErrorMessage'
import Header from 'containers/Header/Header'
import React from 'react'

class ErrorView extends React.Component {
  render() {
    const {data, state, type} = this.props
    const hasConfig = state.app && state.app.config

    // We only treat this as an actual error, and therefore display the error
    // message, if the config has already been loaded. This prevents us from
    // showing a flashing 404 page whilst routes are still being loaded.
    return (
      <>
        <Header />

        <main>
          {(hasConfig || data) && <ErrorMessage type={type} data={data} />}
        </main>
      </>
    )
  }
}

export default connectRedux()(ErrorView)
