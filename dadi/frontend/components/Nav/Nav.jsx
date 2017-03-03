import {h, Component} from 'preact'

import Dropdown from 'components/Dropdown/Dropdown'
import DropdownItem from 'components/DropdownItem/DropdownItem'
import NavItem from 'components/NavItem/NavItem'

import CollectionNav from 'containers/CollectionNav/CollectionNav'

import Style from 'lib/Style'
import styles from './Nav.css'

export default class Nav extends Component {
  render() {
    const {groups, compact} = this.props

    return (
      <nav class={styles.nav}>
        <ul>
          {groups.map(item => {
            let subItems = null

            if (item.collections) {
              let children = item.collections.map(collection => {
                if (compact) {
                  return (
                    <NavItem
                      href={`/${collection.slug}/documents`}
                      text={collection.name}
                      compact={true}
                    />
                  )
                }

                return (
                  <DropdownItem href={`/${collection.slug}/documents`}>{collection.name}</DropdownItem>
                )
              })

              subItems = compact ?
                <ul class={styles.children}>{children}</ul>
                :
                <Dropdown>{children}</Dropdown>

            }

            // (!) This needs to be revisited once we implement routes for groups
            const href = item.slug ? `/${item.slug}/documents` : '#'

            return (
              <NavItem
                href={href}
                text={item.name || item.title}
                compact={compact}
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