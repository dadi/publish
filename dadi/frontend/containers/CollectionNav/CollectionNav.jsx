import {h, Component} from 'preact'
import {Router} from 'preact-router'
import {connect} from 'preact-redux'
import {bindActionCreators} from 'redux'

import {buildUrl} from 'lib/router'

import * as apiActions from 'actions/apiActions'
import * as appActions from 'actions/appActions'

import Nav from 'components/Nav/Nav'

import {connectHelper, slugify} from 'lib/util'

class CollectionNav extends Component {

  groupCollections(sort, collections) {
    if (!collections.length) return []

    const groupedItems = sort.map(menu => {
      if (typeof menu === 'string') {
        const collection = collections.find(collection => collection.slug === menu)
        return {
          id: collection.slug,
          label: collection.name,
          href: buildUrl(collection.slug, 'documents')
        }
      } else {
        const groupSlug = slugify(menu.title)
        const subItems = menu.collections.map(slug => {
          const collection = collections.find(collection => collection.slug === slug)

          return {
            id: collection.slug,
            label: collection.name,
            href: buildUrl(groupSlug, collection.slug, 'documents')
          }
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

    return collections.map(collection => buildUrl(collection.slug, 'documents'))
  }

  componentWillUpdate() {
    const {state, actions} = this.props
    const apis = state.api.apis

    if (apis && apis.length && apis[0].collections) {
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
        currentRoute={state.router.locationBeforeTransitions.pathname}
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
