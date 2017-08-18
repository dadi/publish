import * as Constants from 'lib/constants'

export function visibleFieldList ({
  fields,
  view = 'list'
}) {
  return Object.keys(fields)
    .filter(key => {
      // If there's no publish block, return field by default.
      if (!fields[key].publish || !fields[key].publish.display) return true

      // Return the fields display property value for this view.
      return fields[key].publish.display[view]
    })
    .concat(Constants.DEFAULT_FIELDS)
}

export function filterVisibleFields ({
  fields,
  view = 'list'
}) {
  return Object.assign({}, ...visibleFieldList(...arguments)
    .filter(field => fields[field])
    .map(field => {
      return {[field]: fields[field]}
    }))
}