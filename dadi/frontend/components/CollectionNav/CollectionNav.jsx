'use strict'

import { h, Component } from 'preact'

export default class CollectionNav extends Component {

  render() {
    const { sort, collections } = this.props
    return (
      <div class="CollectionNav">
        <h3>Collections</h3>
        {collections ? (
          <ul class="CollectionList">
            {this.groupCollections(sort, collections).map(collection => (
              <li class="CollectionListItem">
                {collection.name ? (
                  <a href={ `/${collection.slug}/documents` }>{ collection.name }</a>
                ) : (
                  <div>
                    <p>{collection.title}</p>
                    <ul class="CollectionList">
                      {collection[collection.handle].map(collection => (
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
        ) : (
          <h1 />
        )}
      </div>
    )
  }
  groupCollections(sort, collections) {
    let grouping = sort.map(menu => {
      if (typeof menu === 'string') {
        return collections.filter(collection => {
          return collection.slug === menu
        })[0]
      } else {
        Object.keys(menu).map(key => {
          menu.title = key
          menu.handle = key
          Object.assign(menu[key], 
            menu[key].map(slug => {
              return collections.filter(collection => {
                return collection.slug === slug
              })[0]
            })
          )
        })
        return menu
      }
    }).filter(menu => {
      return typeof menu !== 'undefined'
    })
    if (grouping.length) {
      console.log(grouping)
      return grouping
    } else {
      return collections
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    const { collections } = this.props
    if (collections === nextProps.collections) {
      return false
    }
  }
}