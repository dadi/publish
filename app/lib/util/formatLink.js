export default function formatLink(value, displayDirective) {
  if (displayDirective && value) {
    if (typeof displayDirective === 'string') {
      return displayDirective.replace('{value}', value)
    }

    return /^https?:\/\//.test(value) ? value : 'http://' + value
  }

  return null
}
