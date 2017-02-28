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
import Nav from 'components/Nav/Nav'
import NavItem from 'components/NavItem/NavItem'

import { connectHelper } from 'lib/util'

class App extends Component {
  groupCollections (sort, collections) {
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

  componentWillUpdate () {
    const {state, actions} = this.props
    const apis = state.api.apis

    if (apis.length && apis[0].collections) {
      this.groups = this.groupCollections(apis[0].menu || [], apis[0].collections)
    }
  }

  render () {
    const { state, actions } = this.props

    if (!this.groups) {
      return null
    }

    return (
      <Nav
        groups={this.groups}
        compact={state.app.breakpoint === null}
      />
    )
  }
}

export default connectHelper(
  state => state,
  dispatch => bindActionCreators({...userActions, ...apiActions, ...appActions}, dispatch)
)(App)
