export function visibleFieldList ({
  fields,
  view = 'list'
}) {
  return Object.keys(fields)
    .filter(key => {
      // If there's no publish block, return field by default.
      if (!fields[key].publish || !fields[key].publish.display) return true

      // Is the field display value is enabled for this view.
      return fields[key].publish.display[view]
    })
}

export function visibleFields ({
  fields,
  view = 'list'
}) {
  return Object.assign({}, ...visibleFieldList(...arguments)
    .map(field => {
      return {[field]: fields[field]}
    }))
}