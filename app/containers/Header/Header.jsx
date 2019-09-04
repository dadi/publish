import * as userActions from 'actions/userActions'
import CollectionNav from 'containers/CollectionNav/CollectionNav'
import {connectRedux} from 'lib/redux'
import {Link} from 'react-router-dom'
import React from 'react'
import Style from 'lib/Style'
import styles from './Header.css'

class Header extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isUserMenuOpen: false
    }

    this.closeUserMenu = () => this.setState({isUserMenuOpen: false})
    this.toggleUserMenu = () =>
      this.setState(({isUserMenuOpen}) => ({isUserMenuOpen: !isUserMenuOpen}))
  }

  render() {
    const {
      app: {
        config: {
          whitelabel: {displayVersionNumber, logo}
        },
        version
      },
      user: {
        isSignedIn,
        remote: {clientId, data}
      }
    } = this.props
    const {isUserMenuOpen} = this.state

    if (!isSignedIn) {
      return null
    }

    const displayName = (data && data.publishFirstName) || clientId

    const userMenuStyle = new Style(styles, 'user-menu-wrapper').addIf(
      'open',
      isUserMenuOpen
    )

    return (
      <header className={styles.header}>
        <div className={styles.logo}>
          <img src={`/_public/${logo}`} />
        </div>
        <div className={styles.collections}>
          <CollectionNav />
        </div>
        <div className={userMenuStyle.getClasses()}>
          <button
            className={styles['user-menu-toggle']}
            onClick={this.toggleUserMenu}
          >
            <div className={styles.username}>{displayName}</div>
            <i id={styles['expand-icon']} className="material-icons">
              expand_more
            </i>
          </button>
          {isUserMenuOpen && (
            <>
              <div className={styles.overlay} onClick={this.closeUserMenu} />
              <div className={styles['user-menu']}>
                <Link
                  className={`${styles['menu-item']} ${styles['link']}`}
                  onClick={this.closeUserMenu}
                  to="/profile"
                >
                  Profile
                </Link>

                <Link
                  className={`${styles['menu-item']} ${styles['link']}`}
                  onClick={this.closeUserMenu}
                  to="/sign-out"
                >
                  Sign out
                </Link>

                {displayVersionNumber && (
                  <span className={styles['menu-item']}>v{version}</span>
                )}
              </div>
            </>
          )}
        </div>
      </header>
    )
  }
}

const mapState = state => ({user: state.user, app: state.app})

export default connectRedux(mapState, userActions)(Header)
