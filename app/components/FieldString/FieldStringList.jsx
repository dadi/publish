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

    this.hoverOn = () => this.props.onHover(true)
    this.hoverOff = () => this.props.onHover(false)
    this.markEvent = e => {
      e.__innerClick = true
    }
  }

  render() {
    const {internalLink, schema, value, fieldName} = this.props

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
          onClick={this.markEvent}
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

    // Render the value or the a link to the document
    return this.renderValue(value, fieldName)
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
          return match.label
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

  renderValue(value, fieldName) {
    // Get the string fields listed
    const fields = this.props.collection.fields

    // If this is the first field in the table then render value as a link
    if (Object.keys(fields)[0] === fieldName) {
      const link =
        this.props.collection._publishLink + '/' + this.props.document._id

      return (
        <Link
          className={styles['list-link']}
          onClick={this.markEvent}
          onMouseEnter={this.hoverOn}
          onMouseLeave={this.hoverOff}
          to={link}
        >
          {value}
        </Link>
      )
    }

    // Otherwise return the trimmed value
    return this.renderTrimmedValue(value)
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
        onClick={this.markEvent}
        onMouseEnter={this.hoverOn}
        onMouseLeave={this.hoverOff}
        target="_blank"
      >
        {valueFormatted}
      </a>
    )
  }
}
