import * as apiActions from 'actions/apiActions'
import * as appActions from 'actions/appActions'
import * as Constants from 'lib/constants'
import {connectRedux} from 'lib/redux'
import {connectRouter} from 'lib/router'
import Nav from 'components/Nav/Nav'
import proptypes from 'prop-types'
import React from 'react'

class CollectionNav extends React.Component {
  static propTypes = {
    /**
     * The global actions object.
     */
    actions: proptypes.object,
    
    /**
     * The global state object.
     */
    state: proptypes.object
  }

  getNavigationItems(currentCollection) {
    const {state} = this.props
    const {api} = state.app.config
    
    if (!api || !Array.isArray(api.collections)) {
      return []
    }

    // There are some collections that we don't want to display on the menu,
    // like legacy media collections.
    const collections = api.collections.filter(collection => {
      const isMediaCollection = collection.settings &&
        collection.settings.type === 'media'

      return !isMediaCollection
    })

    let navItems = []
    let processedSlugs = {}
    
    const menu = Array.isArray(api.menu) ? api.menu : []

    menu.forEach(item => {
      // Is this entry a top-level collection?
      if (typeof item === 'string') {
        const match = collections.find(({slug}) => slug === item)

        if (match) {
          navItems.push({
            id: match.slug,
            label: match.displayName || match.slug,
            href: match._publishLink,
            isSelected: match.slug === currentCollection
          })

          processedSlugs[match.slug] = true
        }

        return
      }

      // Is this entry a collection group?
      if (Array.isArray(item.collections) && item.title) {
        let groupHasSelectedCollection = false

        const groupCollections = item.collections.map(item => {
          const match = collections.find(({slug}) => slug === item)

          if (match) {
            const {_publishLink, settings = {}, slug} = match
            const isSelected = slug === currentCollection

            if (isSelected) {
              groupHasSelectedCollection = true
            }

            processedSlugs[slug] = true

            return {
              id: slug,
              label: settings.displayName || slug,
              href: _publishLink,
              isSelected
            }
          }
        }).filter(Boolean)

        if (groupCollections.length > 0) {
          navItems.push({
            isSelected: groupHasSelectedCollection,
            label: item.title,
            subItems: groupCollections
          })
        }
      }
    })

    // Adding to the nav any collections that haven't been included in the menu
    // config object.
    collections.forEach(collection => {
      if (processedSlugs[collection.slug]) return

      const {_publishLink, settings = {}, slug} = collection

      navItems.push({
        id: slug,
        label: settings.displayName || slug,
        href: _publishLink,
        isSelected: slug === currentCollection
      })
    })

    return navItems
  }

  render() {
    const {router, state} = this.props
    const {collection} = router.match.params
    const items = this.getNavigationItems(collection)

    items.push({
      id: '_media',
      label: 'Media Library',
      href: '/media',
      isSelected: collection === Constants.MEDIA_COLLECTION_SCHEMA.slug
    })

    return (
      <Nav
        items={items}
        mobile={state.app.breakpoint === null}
      />
    )
  }
}

export default connectRouter(connectRedux(
  apiActions,
  appActions
)(CollectionNav))
