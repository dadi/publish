import {Link} from 'react-router-dom'
import proptypes from 'prop-types'
import React from 'react'
import Style from 'lib/Style'
import styles from './NavItem.css'

/**
 * An item of the main navigation component.
 */
export default class NavItem extends React.Component {
  static propTypes = {
    /**
     * Whether the component corresponds to the currently active page.
     */
    active: proptypes.bool,

    /**
     * The link to be followed when the navigation item is clicked.
     */
    href: proptypes.string,

    /**
     * Whether the navigation item is part of a navigation component in mobile mode.
     */
    mobile: proptypes.bool,

    /**
     * Text content for navigation anchor.
     */
    text: proptypes.string
  }

  static defaultProps = {
    active: false,
    mobile: false
  }

  constructor(props) {
    super(props)

    this.state = {
      expanded: false
    }
  }

  static defaultProps = {
    mobile: false
  }

  render() {
    const {active, children, href, mobile, text} = this.props
    const containerStyle = new Style(styles, 'container')
      .addIf('container-desktop', !mobile)
      .addIf('expanded', this.state.expanded)
    const navItemStyle = new Style(styles, 'nav-item')
      .addIf('active', active)
      .addIf('nav-item-text', !href)

    if (!text) return null

    return (
      <li
        className={containerStyle.getClasses()}
        onMouseEnter={this.toggleExpanded.bind(this, true)}
        onMouseLeave={this.toggleExpanded.bind(this, false)}
      >
        {href && (
          <Link className={navItemStyle.getClasses()} to={href}>
            <span className={styles['nav-item-text']}>{text}</span>
          </Link>
        )}

        {!href && <span className={navItemStyle.getClasses()}>{text}</span>}

        {children && <div className={styles.children}>{children}</div>}
      </li>
    )
  }

  toggleExpanded(expanded, event) {
    this.setState({
      expanded
    })
  }
}
