import { h, Component } from 'preact'

import CtaButton from  '../CtaButton/CtaButton'

export default class Nav extends Component {
  signIn() {
    this.props.signIn('Obi Wan Kenobi')
  }

  render({signedIn, username}) {
    return (
      <nav class="Nav">
        <a href="/apis">Route test</a>
        <h1>Navigation</h1>

        {signedIn ? <p>Welcome, {username}!</p> : <button onClick={this.signIn.bind(this)}>Sign in</button>}
      </nav>
    )
  }
}
