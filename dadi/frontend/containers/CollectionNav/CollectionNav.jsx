import {h, Component} from 'preact'
import {Router} from 'preact-router'
import {connect} from 'preact-redux'
import {bindActionCreators} from 'redux'

import * as apiActions from 'actions/apiActions'
import * as appActions from 'actions/appActions'

import Nav from 'components/Nav/Nav'

import {connectHelper, slugify} from 'lib/util'

class CollectionNav extends Component {
  buildCollectionGroupItem(collection, group) {
    if (!collection) return

    let href = group ? `/${group}` : ''
    href += `/${collection.slug}/documents`

    return {
      id: collection.slug,
      label: collection.name,
      href
    }
  }

  groupCollections(sort, collections) {
    if (!collections.length) return []

    const groupedItems = sort.map(menu => {
      if (typeof menu === 'string') {
        const collection = collections.find(collection => collection.slug === menu)

        return this.buildCollectionGroupItem(collection)
      } else {
        const groupSlug = slugify(menu.title)
        const subItems = menu.collections.map(slug => {
          const collection = collections.find(collection => collection.slug === slug)

          return this.buildCollectionGroupItem(collection, groupSlug)
        })

        return {
          id: groupSlug,
          label: menu.title,
          subItems: subItems,
          href: subItems[0].href
        }
      }
    }).filter(Boolean)

    if (groupedItems.length) {
      return groupedItems
    }

    return collections.map(collection => this.buildCollectionGroupItem(collection))
  }

  componentWillUpdate() {
    const {state, actions} = this.props
    const apis = state.api.apis

    if (apis.length && apis[0].collections) {
      this.groups = this.groupCollections(apis[0].menu || [], apis[0].collections)
    }
  }

  render() {
    const {state, actions} = this.props

    if (!this.groups) {
      return null
    }

    return (
      <Nav
        currentRoute={state.routing.locationBeforeTransitions.pathname}
        items={this.groups}
        mobile={state.app.breakpoint === null}
      />
    )
  }
}

export default connectHelper(
  state => state,
  dispatch => bindActionCreators({...apiActions, ...appActions}, dispatch)
)(CollectionNav)
