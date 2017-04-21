import {Component, h} from 'preact'
import {Router} from 'preact-router'
import {connect} from 'preact-redux'
import {bindActionCreators} from 'redux'

import * as apiActions from 'actions/apiActions'
import * as appActions from 'actions/appActions'

import Nav from 'components/Nav/Nav'

import {buildUrl} from 'lib/router'
import {connectHelper, slugify} from 'lib/util'

class CollectionNav extends Component {
  buildCollectionMap(apis) {
    let groups = {}
    let ungrouped = {}

    apis.forEach(api => {
      let apiCollections = {}
      let displayNames = {}

      // There are some collections that we don't want to display on the menu,
      // like auth or media collections.
      const filteredCollections = api.collections.filter(collection => {
        const isMediaCollection = collection.settings &&
          collection.settings.type === 'media'

        return !collection._isAuthCollection && !isMediaCollection
      })

      // We start by adding all the collections that are referenced in the menu
      // object.
      filteredCollections.forEach(collection => {
        (api.menu || []).forEach(menuEntry => {
          if (menuEntry === collection.slug) {
            apiCollections[collection.slug] = null
          } else if (menuEntry.collections && menuEntry.collections.includes(collection.slug)) {
            apiCollections[collection.slug] = menuEntry.title
          }
        })
      })

      // Then we loop through all collections and add any that is missing from the
      // menu.
      filteredCollections.forEach(collection => {
        apiCollections[collection.slug] = apiCollections[collection.slug] || null

        const displayName = (collection.settings && collection.settings.displayName) || collection.name

        displayNames[collection.slug] = displayName
      })

      // We then merge the collections map for this API with the global map.
      Object.keys(apiCollections).forEach(collection => {
        const mapValue = apiCollections[collection]

        // Is it part of a group?
        if (mapValue) {
          // Create group and collection levels (if they don't exist).
          groups[mapValue] = groups[mapValue] || {}
          groups[mapValue][collection] = groups[mapValue][collection] || []

          // Increment the number of matches at the given group+collection.
          groups[mapValue][collection].push(displayNames[collection])
        } else {
          ungrouped[collection] = ungrouped[collection] || []
          ungrouped[collection].push(displayNames[collection])
        }
      })
    })

    return {
      groups,
      ungrouped
    }
  }

  buildGroups(collectionMap) {
    const grouped = Object.keys(collectionMap.groups).map(groupTitle => {
      const group = collectionMap.groups[groupTitle]
      const groupSlug = slugify(groupTitle)

      let subItems = []

      Object.keys(group).forEach(collection => {
        group[collection].forEach((displayName, i) => {
          const collectionSlug = collection + ((i > 0) ? `-${i + 1}` : '')

          subItems.push({
            id: `${groupSlug}/${collectionSlug}`,
            label: displayName,
            href: buildUrl(groupSlug, collectionSlug, 'documents')
          })
        })
      })

      return {
        id: groupSlug,
        label: groupTitle,
        subItems,
        href: subItems[0].href
      }
    })

    let ungrouped = []

    Object.keys(collectionMap.ungrouped).forEach(collection => {
      const numberOfInstances = collectionMap.ungrouped[collection]

      collectionMap.ungrouped[collection].forEach((displayName, i) => {
        const collectionSlug = collection + ((i > 0) ? `-${i + 1}` : '')

        ungrouped.push({
          id: collectionSlug,
          label: displayName,
          href: buildUrl(null, collectionSlug, 'documents')
        })
      })
    })

    return grouped.concat(ungrouped)
  }

  componentWillUpdate() {
    const {state, actions} = this.props
    const apis = state.api.apis

    if (apis && apis.length) {
      const collectionMap = this.buildCollectionMap(apis)

      this.groups = this.buildGroups(collectionMap)
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
  state => ({
    api: state.api,
    app: state.app,
    router: state.router
  }),
  dispatch => bindActionCreators({...apiActions, ...appActions}, dispatch)
)(CollectionNav)
