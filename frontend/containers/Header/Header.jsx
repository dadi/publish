import {h, Component} from 'preact'
import {route} from '@dadi/preact-router'
import proptypes from 'proptypes'
import {bindActionCreators} from 'redux'

import * as userActions from 'actions/userActions'
import {connectHelper} from 'lib/util'
import * as Constants from 'lib/constants'

import CollectionNav from 'containers/CollectionNav/CollectionNav'

import Style from 'lib/Style'
import styles from './Header.css'

/**
 * The application masthead.
 */
class Header extends Component {
  static propTypes = {
    /**
     * The global actions object.
     */
    actions: proptypes.object,

    /**
     * The text/elements to be rendered inside the header.
     */
    children: proptypes.node,

    /**
     * The schema of the collection being edited.
     */
    currentCollection: proptypes.object,

    /**
     * The global state object.
     */
    state: proptypes.object
  }

  constructor(props) {
    super(props)

    this.state.expanded = false
  }

  render() {
    const {
      children,
      currentCollection,
      state
    } = this.props
    const compact = state.app.breakpoint === null

    const {
      whitelabel: {logo, poweredBy, backgroundImage}
    } = state.app.config || {
      whitelabel: {logo: '', poweredBy: false, backgroundImage: ''}
    }

    if (!state.user.isSignedIn) {
      return null
    }

    let contentStyle = new Style(styles, 'content')
    let innerStyle = new Style(styles)

    contentStyle.addIf('content-compact', compact)
    contentStyle.addIf('content-expanded', this.state.expanded)
    innerStyle.addIf('inner-content-compact', compact)

    let displayName = [
      state.user.remote.data && state.user.remote.data.publishFirstName,
      state.user.remote.data && state.user.remote.data.publishLastName
    ].filter(Boolean).join(' ') || 'Profile'

    return (
      <header class={styles.header}>
        <div class={contentStyle.getClasses()}>
          <div class={styles.account}>
            {logo !== '' && (
              <div class={styles.logo}>
                <img src={logo} />
              </div>
            )}

            <div class={styles['toggle-icon']} onClick={this.toggleCollapsed.bind(this, undefined)}>
              {this.state.expanded ?
                <span class={styles['icon-close']}>Close</span>
                :
                <span class={styles['icon-open']}>Open</span>
              }
            </div>

            {state.user.accessToken && this.state.expanded && (
              <div class={styles.controls}>
                <a href="/profile" class={styles.user}>{displayName}</a>
                <button
                  class={styles.signout}
                  onClick={this.handleSignOut.bind(this)}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>

          <div class={innerStyle.getClasses()} onClick={this.toggleCollapsed.bind(this, false)}>
            <CollectionNav
              currentCollection={currentCollection}
            />
          </div>
        </div>

        {children}
      </header>
    )
  }

  handleSignOut() {
    const {actions} = this.props

    actions.signOut()
  }

  toggleCollapsed(expanded, event) {
    if (expanded === undefined) {
      expanded = !this.state.expanded
    }

    this.setState({
      expanded
    })
  }
}

export default connectHelper(
  state => ({
    api: state.api,
    app: state.app,
    user: state.user
  }),
  dispatch => bindActionCreators(userActions, dispatch)
)(Header)