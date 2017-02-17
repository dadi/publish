'use strict'

import { h, Component } from 'preact'

export default class CollectionNav extends Component {

  componentWillMount() {
    const {sort, collections} = this.props

    this.groups = this.groupCollections(sort, collections)
  }

  render() {
    const { sort, collections } = this.props

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
  }

  groupCollections(sort, collections) {
    if (!collections.length) return []

    let grouping = sort.map(menu => {
      if (typeof menu === 'string') {
        return collections.find(collection => {
          return collection.slug === menu
        })
      } else {
        return Object.assign({}, menu, 
          {collections: menu.collections.map(slug => {
            return collections.find(collection => {
              return collection.slug === slug
            })
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

  shouldComponentUpdate(nextProps, nextState) {
    const { collections } = this.props

    if (collections === nextProps.collections || this.groups) {
      return false
    } else {
      return true
    }
  }
}