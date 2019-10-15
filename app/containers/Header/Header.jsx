import {Close, Menu, Person} from '@material-ui/icons'
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
      areCollectionsInDrawer: true,
      isDrawerOpen: false
    }

    this.outerRef = React.createRef()
    this.shadowRef = React.createRef()

    this.closeDrawer = () => this.setState({isDrawerOpen: false})

    this.toggleDrawer = () =>
      this.setState(({isDrawerOpen}) => ({isDrawerOpen: !isDrawerOpen}))

    this.items = []
  }

  componentDidMount() {
    this.positionNav()
  }

  componentDidUpdate() {
    this.positionNav()
  }

  positionNav() {
    const {areCollectionsInDrawer} = this.state

    const shouldBeInDrawer =
      this.outerRef.current.clientWidth < this.shadowRef.current.offsetWidth + 1

    if (!shouldBeInDrawer && this.state.isDrawerOpen) {
      this.setState({isDrawerOpen: false})
    }

    if (shouldBeInDrawer !== areCollectionsInDrawer) {
      this.setState({areCollectionsInDrawer: shouldBeInDrawer})
    }
  }

  render() {
    const {app, route, user} = this.props
    const {config, version} = app
    const {api, whitelabel} = config
    const {displayVersionNumber, logoLight} = whitelabel
    const {collection: collectionName} = route.params
    const {areCollectionsInDrawer, isDrawerOpen, isUserMenuOpen} = this.state
    const menuItems = buildGroupedMenuItems(api, collectionName)
    const userMenuWrapperStyle = new Style(styles, 'user-menu-wrapper').addIf(
      'open',
      isUserMenuOpen
    )

    if (!user.isSignedIn) return null

    const navList = (
      <ul className={styles['header-nav-list']}>
        {menuItems.map(item => (
          <li key={item.id || item.label}>
            <NavItem item={item} />
          </li>
        ))}
      </ul>
    )

    return (
      <header className={styles.header}>
        <div className={styles['collections-wrapper']} ref={this.outerRef}>
          {/* An invisible nav element whose width we measure to determine
          whether the nav would fit in the header and thus whether it should
          be in the drawer or not. */}
          <div className={styles['shadow-wrapper']}>
            <div
              aria-hidden
              className={styles['shadow-nav']}
              ref={this.shadowRef}
            >
              {navList}
            </div>
          </div>
          {areCollectionsInDrawer ? (
            <div className={styles['drawer-wrapper']}>
              <button
                className={styles['drawer-toggle']}
                onClick={this.toggleDrawer}
              >
                {isDrawerOpen ? (
                  <Close fontSize="large" />
                ) : (
                  <Menu fontSize="large" />
                )}
              </button>
              <div
                aria-hidden={isDrawerOpen ? null : true}
                className={`${styles.overlay} ${styles.dark}`}
                onClick={this.closeDrawer}
              />
              <div
                aria-hidden={isDrawerOpen ? null : true}
                className={styles['collections-drawer']}
              >
                <button
                  className={styles['drawer-toggle']}
                  onClick={this.closeDrawer}
                >
                  <Close fontSize="large" />
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
            </div>
          ) : (
            <nav>{navList}</nav>
          )}
        </div>

        <div className={userMenuWrapperStyle.getClasses()}>
          <button className={styles['user-menu-toggle']}>
            <Person />
          </button>

          <div className={styles['user-menu']}>
            <Link
              className={`${styles['menu-item']} ${styles['link']}`}
              to="/profile"
            >
              Profile
            </Link>

            <Link
              className={`${styles['menu-item']} ${styles['link']}`}
              to="/sign-out"
            >
              Sign out
            </Link>

            {displayVersionNumber && (
              <span className={styles['menu-item']}>v{version}</span>
            )}
          </div>
        </div>

        <div className={styles.logo}>
          <Link to="/">
            <img src={`/_public/${logoLight}`} />
          </Link>
        </div>
      </header>
    )
  }
}

const mapState = state => ({user: state.user, app: state.app})

export default connectRouter(connectRedux(mapState)(Header))
