import Dropdown from 'components/Dropdown/Dropdown'
import DropdownItem from 'components/Dropdown/DropdownItem'
import NavItem from 'components/NavItem/NavItem'
import proptypes from 'prop-types'
import React from 'react'

/**
 * The main navigation component.
 */
export default class Nav extends React.Component {
  static propTypes = {
    /**
     * Grouped list of navigation elements to render. Each item in the array
     * must be an object with the following properties:
     *
     * - id (string): unique identifier
     * - label (string): item label
     * - href (string): item link
     * - isSelected (bool): whether the item is currently selected
     * - subItems (array): child elements
     *
     * Child elements must also be objects with the structure above.
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
    const {items, mobile} = this.props

    if (!items.length) return null

    return (
      <nav>
        <ul>
          {items.map(item => {
            let subItems = null

            if (item.subItems) {
              const children = item.subItems.map(subItem => {
                if (mobile) {
                  return (
                    <NavItem
                      href={subItem.href}
                      key={subItem.href}
                      mobile={true}
                      text={subItem.label}
                    />
                  )
                }

                return (
                  <DropdownItem
                    active={subItem.isSelected}
                    href={subItem.href}
                    key={subItem.href}
                  >
                    {subItem.label}
                  </DropdownItem>
                )
              })

              subItems = mobile ? (
                <ul>{children}</ul>
              ) : (
                <Dropdown>{children}</Dropdown>
              )
            }

            return (
              <NavItem
                active={item.isSelected}
                href={item.href}
                key={item.label + item.href}
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
