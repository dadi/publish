import * as userActions from 'actions/userActions'
import CollectionNav from 'containers/CollectionNav/CollectionNav'
import {connectRedux} from 'lib/redux'
import {Link} from 'react-router-dom'
import proptypes from 'prop-types'
import React from 'react'
import Style from 'lib/Style'
import styles from './Header.css'

/**
 * The application masthead.
 */
class Header extends React.Component {
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
     * The global state object.
     */
    state: proptypes.object
  }

  constructor(props) {
    super(props)

    this.state = {
      expanded: false
    }
  }

  render() {
    const {children, state} = this.props
    const compact = state.app.breakpoint === null

    const {whitelabel} = state.app.config
    const {displayVersionNumber, logo} = whitelabel

    if (!state.user.isSignedIn) {
      return null
    }

    const contentStyle = new Style(styles, 'content')
    const innerStyle = new Style(styles)

    contentStyle.addIf('content-compact', compact)
    contentStyle.addIf('content-expanded', this.state.expanded)
    innerStyle.addIf('inner-content-compact', compact)

    const displayName =
      [
        state.user.remote.data && state.user.remote.data.publishFirstName,
        state.user.remote.data && state.user.remote.data.publishLastName
      ]
        .filter(Boolean)
        .join(' ') || 'Profile'

    return (
      <header className={styles.header}>
        <div className={contentStyle.getClasses()}>
          <div className={styles.account}>
            <div className={styles.logo}>
              <img src={`/_public/${logo}`} />
            </div>

            <div
              className={styles['toggle-icon']}
              onClick={this.toggleCollapsed.bind(this, undefined)}
            >
              {this.state.expanded ? (
                <span className={styles['icon-close']}>Close</span>
              ) : (
                <span className={styles['icon-open']}>Open</span>
              )}
            </div>

            {state.user.accessToken && this.state.expanded && (
              <div className={styles.controls}>
                <Link
                  className={`${styles.control} ${styles['control-action']}`}
                  to="/profile"
                >
                  {displayName}
                </Link>

                <Link
                  className={`${styles.control} ${styles['control-action']}`}
                  to="/sign-out"
                >
                  Sign out
                </Link>

                {displayVersionNumber && (
                  <span className={styles.control}>v{state.app.version}</span>
                )}
              </div>
            )}
          </div>

          <div
            className={innerStyle.getClasses()}
            onClick={this.toggleCollapsed.bind(this, false)}
          >
            <CollectionNav />
          </div>
        </div>

        {children}
      </header>
    )
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

export default connectRedux(userActions)(Header)
