import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Dropdown from 'components/Dropdown/Dropdown'
import DropdownItem from 'components/Dropdown/DropdownItem'
import NavItem from 'components/NavItem/NavItem'

import Style from 'lib/Style'
import styles from './Nav.css'

/**
 * The main navigation component.
 */
export default class Nav extends Component {
  static propTypes = {
    /*
     * Current selected collection.
     */
    currentCollection: proptypes.object,
    /**
     * Grouped list of navigation elements to render.
     */
    items: proptypes.array.isRequired,

    /**
     * Whether to render the navigation in mobile mode,
     * with a collapsible drawer controlled by a hamburger button.
     */
    mobile: proptypes.bool
  }

  static defaultProps = {
    items: [],
    mobile: false
  }

  render() {
    const {
      currentCollection,
      items,
      mobile
    } = this.props

    if (!items.length) return null

    return (
      <nav class={styles.nav}>
        <ul>
          {items.map(item => {
            let itemActive = currentCollection && item.id === currentCollection.slug
            let activeSubItem = item.subItems && item.subItems
              .find(subItem => currentCollection && subItem.id === `${item.id}/${currentCollection.slug}`)
            if (activeSubItem) {
              itemActive = true
            }
            let subItems = null

            if (item.subItems) {
              let children = item.subItems.map(subItem => {
                let subItemActive = activeSubItem && subItem.id === activeSubItem.id

                if (mobile) {
                  return (
                    <NavItem
                      href={subItem.href}
                      text={subItem.label}
                      mobile={true}
                    />
                  )
                }

                return (
                  <DropdownItem
                    active={subItemActive}
                    href={subItem.href}
                  >
                    {subItem.label}
                  </DropdownItem>
                )
              })

              subItems = mobile ?
                <ul class={styles.children}>{children}</ul>
                :
                <Dropdown>{children}</Dropdown>

            }

            return (
              <NavItem
                active={itemActive}
                href={item.href}
                text={item.label}
                mobile={mobile}
              >
                {subItems}
              </NavItem>
            )
          })}
        </ul>
      </nav>
    )
  }
}