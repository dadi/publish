import buildGroupedMenuItems from './buildGroupedMenuItems'
import {connectRedux} from 'lib/redux'
import {connectRouter} from 'lib/router'
import {Link} from 'react-router-dom'
import NavItem from 'components/NavItem/NavItem'
import React from 'react'
import Style from 'lib/Style'
import styles from './Header.css'

class Header extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      collectionsInDrawer: true,
      isDrawerOpen: false,
      isUserMenuOpen: false
    }

    this.outerRef = React.createRef()
    this.shadowRef = React.createRef()

    this.closeDrawer = () => this.setState({isDrawerOpen: false})
    this.closeUserMenu = () => this.setState({isUserMenuOpen: false})

    this.toggleDrawer = () =>
      this.setState(({isDrawerOpen}) => ({isDrawerOpen: !isDrawerOpen}))
    this.toggleUserMenu = () =>
      this.setState(({isUserMenuOpen}) => ({isUserMenuOpen: !isUserMenuOpen}))
  }

  componentDidMount() {
    this.setDrawer()
  }

  componentDidUpdate() {
    this.setDrawer()
  }

  setDrawer() {
    if (!this.outerRef.current || !this.shadowRef.current) return

    const shouldBeInDrawer =
      this.outerRef.current.clientWidth <= this.shadowRef.current.clientWidth

    if (!shouldBeInDrawer && this.state.isDrawerOpen) {
      this.setState({isDrawerOpen: false})
    }

    if (shouldBeInDrawer !== this.state.collectionsInDrawer) {
      this.setState({collectionsInDrawer: shouldBeInDrawer})
    }
  }

  render() {
    const {
      app: {
        config: {
          api,
          whitelabel: {displayVersionNumber, logo}
        },
        version
      },
      route: {
        params: {collection: collectionName}
      },
      user: {
        remote: {clientId, data}
      }
    } = this.props
    const {collectionsInDrawer, isDrawerOpen, isUserMenuOpen} = this.state
    const menuItems = buildGroupedMenuItems(api, collectionName)
    const displayName = (data && data.publishFirstName) || clientId

    const userMenuWrapperStyle = new Style(styles, 'user-menu-wrapper').addIf(
      'open',
      isUserMenuOpen
    )

    return (
      <header className={styles.header}>
        <div className={styles['collections-wrapper']} ref={this.outerRef}>
          {collectionsInDrawer ? (
            <div className={styles['drawer-wrapper']}>
              <button
                className={styles['drawer-toggle']}
                onClick={this.toggleDrawer}
              >
                <i className="material-icons" id={styles['menu-icon']}>
                  menu
                </i>
              </button>
              {isDrawerOpen && (
                <>
                  <div
                    className={`${styles.overlay} ${styles.dark}`}
                    onClick={this.closeDrawer}
                  />
                  <div className={styles['collections-drawer']}>
                    <button
                      className={styles['drawer-toggle']}
                      onClick={this.closeDrawer}
                    >
                      <i className="material-icons" id={styles['close-icon']}>
                        close
                      </i>
                    </button>
                    <nav>
                      <ul className={styles['drawer-nav-list']}>
                        {menuItems.map(item => (
                          <li key={item.id || item.label}>
                            <NavItem
                              closeMenu={this.closeDrawer}
                              inDrawer
                              item={item}
                            />
                          </li>
                        ))}
                      </ul>
                    </nav>
                  </div>
                </>
              )}
            </div>
          ) : (
            <nav>
              <ul className={styles['header-nav-list']}>
                {menuItems.map(item => (
                  <li key={item.id || item.label}>
                    <NavItem item={item} />
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>

        {/* Invisible copy of the header nav list to grab width from. */}
        <ul
          className={`${styles['header-nav-list']} ${styles['shadow-list']}`}
          ref={this.shadowRef}
        >
          {menuItems.map(item => (
            <li key={item.id || item.label}>
              <NavItem item={item} />
            </li>
          ))}
        </ul>

        <div className={styles.logo}>
          <img src={`/_public/${logo}`} />
        </div>

        <div className={userMenuWrapperStyle.getClasses()}>
          <button
            className={styles['user-menu-toggle']}
            onClick={this.toggleUserMenu}
          >
            <div className={styles.username}>{displayName}</div>
            <i className="material-icons" id={styles['expand-icon']}>
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

export default connectRouter(connectRedux(mapState)(Header))
