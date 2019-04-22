import * as apiActions from 'actions/apiActions'
import * as appActions from 'actions/appActions'
import {bindActionCreators} from 'redux'
import {Component, h} from 'preact'
import {connectHelper} from 'lib/util'
import {Format} from 'lib/util/string'
import Nav from 'components/Nav/Nav'
import proptypes from 'proptypes'

class CollectionNav extends Component {
  static propTypes = {
    /**
     * The current selected collection.
     */
    currentCollection: proptypes.object,

    /**
     * The global state object.
     */
    state: proptypes.object
  }

  getNavigationItems(api) {
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
            href: match._publishLink
          })

          processedSlugs[match.slug] = true
        }

        return
      }

      // Is this entry a collection group?
      if (Array.isArray(item.collections) && item.title) {
        const groupSlug = Format.slugify(item.title)
        const groupCollections = item.collections.map(item => {
          const match = collections.find(({slug}) => slug === item)

          if (match) {
            const {_publishLink, settings = {}, slug} = match

            processedSlugs[slug] = true

            return {
              id: slug,
              label: settings.displayName || slug,
              href: _publishLink
            }
          }
        }).filter(Boolean)

        if (groupCollections.length > 0) {
          navItems.push({
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
        href: _publishLink
      })
    })

    return navItems
  }

  render() {
    const {currentCollection, state} = this.props
    const apis = state.api.apis
    const items = this.getNavigationItems(apis[0])

    items.push({
      id: '_media',
      label: 'Media Library',
      href: '/media'
    })

    return (
      <Nav
        currentCollection={currentCollection}
        items={items}
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
