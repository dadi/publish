import buildGroupedMenuItems from './buildGroupedMenuItems'
import {connectRedux} from 'lib/redux'
import {connectRouter} from 'lib/router'
import Dropdown from 'components/Dropdown/Dropdown'
import DropdownItem from 'components/Dropdown/DropdownItem'
import NavItem from 'components/NavItem/NavItem'
import React from 'react'

class CollectionNav extends React.Component {
  render() {
    const {
      route: {
        params: {collection}
      },
      state: {
        app: {
          breakpoint,
          config: {api}
        }
      }
    } = this.props

    const items = buildGroupedMenuItems(api, collection)
    const mobile = breakpoint === null

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

export default connectRouter(connectRedux()(CollectionNav))
