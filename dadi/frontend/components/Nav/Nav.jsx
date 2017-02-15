import { h, Component } from 'preact'

import CollectionNav from 'components/CollectionNav/CollectionNav'

export default class Nav extends Component {

  render() {
    const { apis } = this.props
    return (
      <nav class="Nav">
        <h2>Navigation</h2>
        <h3>General</h3>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/profile">Profile</a></li>
        </ul>
        <CollectionNav collections={ apis[0] ? apis[0].collections : [] } />
      </nav>
    )
  }
}