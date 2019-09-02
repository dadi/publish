import * as userActions from 'actions/userActions'
import CollectionNav from 'containers/CollectionNav/CollectionNav'
import {connectRedux} from 'lib/redux'
import IconArrow from 'components/IconArrow/IconArrow'
import {Link} from 'react-router-dom'
import React from 'react'
import styles from './Header.css'

class Header extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      expanded: false
    }

    this.closeUserMenu = () => this.setState({expanded: false})
    this.toggleUserMenu = () =>
      this.setState(({expanded}) => ({expanded: !expanded}))
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
    const {expanded} = this.state

    if (!isSignedIn) {
      return null
    }

    const displayName = (data && data.publishFirstName) || clientId

    return (
      <header className={styles.header}>
        <div className={styles.logo}>
          <img src={`/_public/${logo}`} />
        </div>
        <div className={styles.collections}>
          <CollectionNav />
        </div>
        <div className={styles['user-menu-wrapper']}>
          <button
            className={styles['user-menu-toggle']}
            onClick={this.toggleUserMenu}
          >
            <div className={styles.username}>{displayName}</div>
            <IconArrow
              width={8}
              height={5}
              direction={expanded ? 'up' : 'down'}
            />{' '}
          </button>
          {expanded && (
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
