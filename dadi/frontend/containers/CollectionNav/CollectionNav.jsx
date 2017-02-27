import { h, Component } from 'preact'
import { Router, route } from 'preact-router'
import { connect } from 'preact-redux'
import { bindActionCreators } from 'redux'

import * as userActions from 'actions/userActions'
import * as apiActions from 'actions/apiActions'
import * as appActions from 'actions/appActions'

import Dropdown from 'components/Dropdown/Dropdown'
import DropdownItem from 'components/DropdownItem/DropdownItem'
import Main from 'components/Main/Main'
import NavItem from 'components/NavItem/NavItem'

import { connectHelper } from 'lib/util'

class App extends Component {
  groupCollections(sort, collections) {
    if (!collections.length) return []

    let grouping = sort.map(menu => {
      if (typeof menu === 'string') {
        return collections.find(collection => collection.slug === menu)
      } else {
        return Object.assign({}, menu, 
          {collections: menu.collections.map(slug => {
            return collections.find(collection => collection.slug === slug)
          })}
        )
      }
    }).filter(menu => {
      return typeof menu !== 'undefined'
    })

    if (grouping.length) {
      return grouping
    } else {
      return collections
    }
  }

  componentWillUpdate() {
    const {state, actions} = this.props
    const apis = state.api.apis

    if (apis.length && apis[0].collections) {
      this.groups = this.groupCollections(apis[0].menu || [], apis[0].collections)
    }
  }

  render() {
    const { state, actions } = this.props

    if (!this.groups) {
      return null
    }

    return (
      <div>
        {this.groups.map(item => {
          let subItems = null

          if (item.collections) {
            let children = item.collections.map(collection => {
              return (
                <DropdownItem href={`/${collection.slug}/documents`}>{collection.name}</DropdownItem>
              )
            })

            subItems = <Dropdown>{children}</Dropdown>
          }

          // (!) This needs to be revisited once we implement routes for groups
          const href = item.slug ? `/${item.slug}/documents` : '#'

          return (
            <NavItem
              href={href}
              text={item.name || item.title}
            >
              {subItems}
            </NavItem>
          )
        })}
      </div>
    )

    return (
      <div class="CollectionNav">
        <h3>Collections</h3>
        {this.groups &&
          <ul class="CollectionList">
            {this.groups.map(collection => (
              <li class="CollectionListItem">
                {collection.name ? (
                  <a href={ `/${collection.slug}/documents` }>{ collection.name }</a>
                ) : (
                  <div>
                    <p>{collection.title}</p>
                    <ul class="CollectionList">
                      {collection.collections.map(collection => (
                        <li>
                          <a href={ `/${collection.slug}/documents` }>{ collection.name }</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        }
      </div>
    )

    return (
      <div>
        <NavItem text="Main"/>
        <NavItem text="Test">
          <Dropdown>
            <DropdownItem>Hello world</DropdownItem>
            <DropdownItem>Hello world</DropdownItem>
            <DropdownItem>Hello world</DropdownItem>
            <DropdownItem>Hello world</DropdownItem>
          </Dropdown>
        </NavItem>
        <NavItem text="Magazine" active={true}/>
      </div>
    )
  }
}

export default connectHelper(
  state => state,
  dispatch => bindActionCreators({...userActions, ...apiActions, ...appActions}, dispatch)
)(App)
