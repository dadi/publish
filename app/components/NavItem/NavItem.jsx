import {Link} from 'react-router-dom'
import React from 'react'
import Style from 'lib/Style'
import styles from './NavItem.css'

/**
 * An item of the main navigation component.
 */
export default class NavItem extends React.Component {
  constructor(props) {
    super(props)

    this.state = {isOpen: false}

    this.closeDropdown = () => this.setState({isOpen: false})
    this.openDropdown = () => this.setState({isOpen: true})
    this.toggleDropdown = () => this.setState(({isOpen}) => ({isOpen: !isOpen}))
  }

  render() {
    const {closeMenu, inDrawer, item, labelRef} = this.props
    const {href, isSelected, label, subItems} = item
    const {isOpen} = this.state

    const containerStyle = new Style(styles, 'container')
      .addIf('in-drawer', inDrawer)
      .addIf('open', isOpen)
      .addIf('active', isSelected)
      .addIf('group', subItems)

    const labelJsx = href ? (
      <Link
        className={styles.label}
        onClick={closeMenu}
        innerRef={labelRef}
        to={href}
      >
        {label}
      </Link>
    ) : (
      <span className={styles.label} ref={labelRef}>
        {label}{' '}
        <i className="material-icons" id={styles['expand-icon']}>
          expand_more
        </i>
      </span>
    )

    const subItemsJsx =
      subItems &&
      subItems.map(subItem => {
        const subItemStyle = new Style(styles, 'dropdown-item').addIf(
          'active',
          subItem.isSelected
        )

        return (
          <Link
            className={subItemStyle.getClasses()}
            onClick={closeMenu}
            key={subItem.id}
            to={subItem.href}
          >
            {subItem.label}
          </Link>
        )
      })

    return inDrawer ? (
      <div className={containerStyle.getClasses()}>
        <div onClick={this.toggleDropdown}>{labelJsx}</div>
        {subItems && isOpen && (
          <div className={styles['sub-items']}>{subItemsJsx}</div>
        )}
      </div>
    ) : (
      <div
        className={containerStyle.getClasses()}
        onMouseEnter={this.openDropdown}
        onMouseLeave={this.closeDropdown}
      >
        {labelJsx}
        {subItems && isOpen && (
          <div className={styles.dropdown}>{subItemsJsx}</div>
        )}
      </div>
    )
  }
}
