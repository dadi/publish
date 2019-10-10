import {Close, Menu, Person} from '@material-ui/icons'
import buildGroupedMenuItems from './buildGroupedMenuItems'
import {connectRedux} from 'lib/redux'
import {connectRouter} from 'lib/router'
import {Link} from 'react-router-dom'
import NavItem from 'components/NavItem/NavItem'
import React from 'react'
import Style from 'lib/Style'
import styles from './Header.css'

const HEADER_RESERVED_WIDTH = 210
const HEADER_ITEM_MARGIN = 24

class Header extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      collectionsInDrawer: true,
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

  handleItemRef(index, el) {
    this.items[index] = el
  }

  positionNav() {
    const {user} = this.props

    if (!user.isSignedIn) return

    const totalWidth = this.items.reduce(
      (sum, item) => sum + item.offsetWidth + HEADER_ITEM_MARGIN,
      0
    )
    const availableWidth = this.props.app.windowWidth - HEADER_RESERVED_WIDTH
    const shouldBeInDrawer = totalWidth > availableWidth

    if (!shouldBeInDrawer && this.state.isDrawerOpen) {
      this.setState({isDrawerOpen: false})
    }

    if (shouldBeInDrawer !== this.state.collectionsInDrawer) {
      this.setState({collectionsInDrawer: shouldBeInDrawer})
    }
  }

  render() {
    const {app, route, user} = this.props
    const {config, version} = app
    const {api, whitelabel} = config
    const {displayVersionNumber, logoLight} = whitelabel
    const {collection: collectionName} = route.params
    const {collectionsInDrawer, isDrawerOpen, isUserMenuOpen} = this.state
    const menuItems = buildGroupedMenuItems(api, collectionName)
    const displayName =
      user.remote['data.publishFirstName'] || user.remote.clientId
    const userMenuWrapperStyle = new Style(styles, 'user-menu-wrapper').addIf(
      'open',
      isUserMenuOpen
    )

    if (!user.isSignedIn) return null

    return (
      <header className={styles.header}>
        <div className={styles['collections-wrapper']} ref={this.outerRef}>
          {collectionsInDrawer ? (
            <div className={styles['drawer-wrapper']}>
              <button
                className={styles['drawer-toggle']}
                onClick={this.toggleDrawer}
              >
                <Menu fontSize="large" />
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
                    {menuItems.map((item, index) => (
                      <li key={item.id || item.label}>
                        <NavItem
                          closeMenu={this.closeDrawer}
                          inDrawer
                          item={item}
                          labelRef={this.handleItemRef.bind(this, index)}
                        />
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </div>
          ) : (
            <nav>
              <ul className={styles['header-nav-list']}>
                {menuItems.map((item, index) => (
                  <li key={item.id || item.label}>
                    <NavItem
                      item={item}
                      labelRef={this.handleItemRef.bind(this, index)}
                    />
                  </li>
                ))}
              </ul>
            </nav>
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
