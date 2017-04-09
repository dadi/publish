import {h, Component} from 'preact'
import proptypes from 'proptypes'
import {slugify} from 'lib/util'

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
    /**
     * Grouped list of navigation elements to render.
     */
    items: proptypes.array,

    /**
     * Whether to render the navigation in mobile mode, with a collapsible drawer controlled by a hamburger button.
     */
    mobile: proptypes.bool
  }

  static defaultProps = {
    items: [],
    mobile: false
  }

  render() {
    const {
      currentRoute,
      items,
      mobile
    } = this.props

    return (
      <nav class={styles.nav}>
        <ul>
          {items.map(item => {
            let itemActive = currentRoute.indexOf(item.id) === 1
            let subItems = null

            if (item.subItems) {
              let children = item.subItems.map(subItem => {
                let subItemActive = currentRoute.indexOf(subItem.id) === 1

                if (mobile) {
                  return (
                    <NavItem
                      href={subItem.href}
                      text={subItem.label}
                      mobile={true}
                    />
                  )
                }

                if (subItemActive) {
                  itemActive = true
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