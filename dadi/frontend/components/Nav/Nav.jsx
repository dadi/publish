import {h, Component} from 'preact'
import {slugify} from 'lib/util'

import Dropdown, {DropdownItem} from 'components/Dropdown/Dropdown'
import NavItem from 'components/NavItem/NavItem'

import CollectionNav from 'containers/CollectionNav/CollectionNav'

import Style from 'lib/Style'
import styles from './Nav.css'

export default class Nav extends Component {
  static defaultProps = {
    groups: [],
    mobile: false
  }

  render() {
    const {groups, mobile} = this.props

    return (
      <nav class={styles.nav}>
        <ul>
          {groups.map(item => {
            let subItems = null

            if (item.collections) {
              let slug = slugify(item.title)
              let children = item.collections.map(collection => {
                const link = `/${slug}/${collection.slug}/documents`

                if (mobile) {
                  return (
                    <NavItem
                      href={link}
                      text={collection.name}
                      mobile={true}
                    />
                  )
                }

                return (
                  <DropdownItem href={link}>{collection.name}</DropdownItem>
                )
              })

              subItems = mobile ?
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