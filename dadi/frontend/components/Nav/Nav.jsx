import {h, Component} from 'preact'
import proptypes from 'proptypes'
import {slugify} from 'lib/util'

import Dropdown from 'components/Dropdown/Dropdown'
import DropdownItem from 'components/Dropdown/DropdownItem'
import NavItem from 'components/NavItem/NavItem'

import CollectionNav from 'containers/CollectionNav/CollectionNav'

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
    groups: proptypes.array,

    /**
     * Whether to render the navigation in mobile mode, with a collapsible drawer controlled by a hamburger button.
     */
    mobile: proptypes.bool
  }

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