import {Link} from 'react-router-dom'
import proptypes from 'prop-types'
import React from 'react'
import styles from './FieldString.css'

/**
 * Component for rendering API fields of type String on a list view.
 */
export default class FieldStringList extends React.Component {
  static propTypes = {
    /**
     * The field value.
     */
    value: proptypes.string,

    /**
     * The field schema.
     */
    schema: proptypes.object
  }

  static defaultProps = {
    maxLength: 50,
    maxOptions: 1
  }

  constructor(props) {
    super(props)

    this.hoverOn = () => props.onHover(true)
    this.hoverOff = () => props.onHover(false)
    this.stopPropagation = e => e.stopPropagation()
  }

  render() {
    const {internalLink, schema, value} = this.props

    // If there's no value, we return `null`.
    if (!value) return null

    // If the value is an array, we render each option individually.
    if (Array.isArray(value)) {
      return this.renderOptions(value, schema)
    }

    // If it is a link field
    if (
      schema.publish &&
      schema.publish.display &&
      schema.publish.display.link
    ) {
      return this.renderLinkValue(value, schema.publish.display.link)
    }

    if (internalLink) {
      return (
        <Link
          className={styles['list-link']}
          onClick={this.stopPropagation}
          onMouseEnter={this.hoverOn}
          onMouseLeave={this.hoverOff}
          to={internalLink}
        >
          {value}
        </Link>
      )
    }

    // If there's an options block, we render the label of the given option.
    if (schema.publish && schema.publish.options) {
      return this.renderOptions([value], schema)
    }

    return this.renderTrimmedValue(value)
  }

  renderOptions(options, schema) {
    const {maxLength, maxOptions} = this.props
    const optionsBlock = schema.publish && schema.publish.options

    let optionsArray = options

    if (optionsBlock) {
      optionsArray = options.map(option => {
        const match = optionsBlock.find(optionBlock => {
          return optionBlock.value === option
        })

        if (match) {
          return this.renderTrimmedValue(match.label, maxLength / maxOptions)
        }

        return this.renderTrimmedValue(option, maxLength / maxOptions)
      })
    }

    const excessOptions = options.length - maxOptions

    if (excessOptions > 0) {
      optionsArray = optionsArray.slice(0, maxOptions)
    }

    const optionsString =
      optionsArray.join(', ') + (excessOptions > 0 ? ` + ${excessOptions}` : '')

    return optionsString
  }

  renderTrimmedValue(value) {
    return <span className={styles['with-ellipsis']}>{value}</span>
  }

  renderLinkValue(value, template) {
    const valueFormatted = value.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '')

    if (typeof template === 'string') {
      value = template.replace(/{value}/, value)
    }

    return (
      <a
        className={styles['list-link']}
        href={value}
        onClick={this.stopPropagation}
        onMouseEnter={this.hoverOn}
        onMouseLeave={this.hoverOff}
        target="_blank"
      >
        {valueFormatted}
      </a>
    )
  }
}
