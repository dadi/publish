import DocumentEditView from 'views/DocumentEditView/DocumentEditView'
import DocumentListView from 'views/DocumentListView/DocumentListView'
import React from 'react'
import {slugify} from '../../../shared/lib/string'

const baseRoutes = [
  {
    path: '/:collection/new/:section?',
    render: props => <DocumentEditView {...props} isNewDocument />
  },
  {
    path: '/:collection/:documentId/:section?',
    component: DocumentEditView
  },
  {
    path: '/:collection',
    component: DocumentListView
  }
]

export default function buildRoutes({
  collections = [],
  menu: menuGroups = [],
  isMultiProperty
}) {
  const singleDocCollections = []
  const multiDocCollections = []

  for (const collection of collections) {
    if (
      collection.settings &&
      collection.settings.publish &&
      collection.settings.publish.isSingleDocument
    ) {
      singleDocCollections.push(collection)
    } else {
      multiDocCollections.push(collection)
    }
  }

  const validMenuGroups = menuGroups
    .filter(
      group =>
        typeof group.title === 'string' &&
        group.title.length &&
        Array.isArray(group.collections) &&
        group.collections.length
    )
    .map(group => ({...group, slug: slugify(group.title)}))

  const singleDocRoutes = singleDocCollections.map(collection => {
    const group = validMenuGroups.find(group =>
      group.collections.includes(collection.slug)
    )

    return {
      path: (group ? `/${group.slug}` : '') + `/${collection.slug}/:section?`,
      render: props => {
        const {params} = props.route

        params.group = group ? group.slug : undefined
        params.collection = collection.slug

        return <DocumentListView {...props} isSingleDocument />
      }
    }
  })

  const multiDocRoutes = validMenuGroups
    .map(group =>
      group.collections.map(collectionSlug =>
        baseRoutes.map(route => ({
          path: `/${group.slug}${route.path.replace(
            ':collection',
            collectionSlug
          )}`,
          render(props) {
            const {params} = props.route

            params.group = group.slug
            params.collection = collectionSlug

            if (route.render) {
              return route.render(props)
            }

            const Component = route.component

            return <Component {...props} />
          }
        }))
      )
    )
    .flat(2)

  const routes = [...singleDocRoutes, ...multiDocRoutes, ...baseRoutes]

  return isMultiProperty
    ? routes.map(route => ({
        ...route,
        path: '/:property' + route.path
      }))
    : routes
}
