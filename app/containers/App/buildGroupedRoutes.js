import React from 'react'
import {slugify} from '../../../shared/lib/string'

export default function buildGroupedRoutes(menuGroups, baseRoutes) {
  if (!menuGroups || !menuGroups.length) return []

  const routes = []

  const validMenuGroups = menuGroups.filter(
    group =>
      typeof group.title === 'string' &&
      group.title.length &&
      Array.isArray(group.collections) &&
      group.collections.length
  )

  if (!validMenuGroups.length) return []

  for (const {title, collections} of validMenuGroups) {
    const group = slugify(title)

    for (const collection of collections) {
      for (const route of baseRoutes) {
        const path = `/${group}${route.path.replace(':collection', collection)}`

        const render = props => {
          const {params} = props.route

          params.group = group
          params.collection = collection

          if (route.render) {
            return route.render(props)
          }

          const Component = route.component

          return <Component {...props} />
        }

        routes.push({path, render})
      }
    }
  }

  return routes
}
