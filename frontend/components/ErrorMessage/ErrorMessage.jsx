'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import * as Constants from 'lib/constants'

import Button from 'components/Button/Button'
import HeroMessage from 'components/HeroMessage/HeroMessage'

/**
 * An error message using the HeroMessage component.
 */
export default class ErrorMessage extends Component {
  static propTypes = {
    /**
     * An object with arbitrary data that varies depending on the error type.
     */
    data: proptypes.object,

    /**
     * The type of error to display.
     */
    type: proptypes.string
  }

  static defaultProps = {
    data: {}
  }

  render() {
    const errorData = this.getErrorData()

    return (
      <HeroMessage
        title={errorData.title}
        subtitle={errorData.message}
      >
        {errorData.body || null}
      </HeroMessage>
    )
  }

  getErrorData() {
    const {
      data,
      type
    } = this.props

    switch (type) {
      case Constants.ERROR_DOCUMENT_NOT_FOUND:
        return {
          body: data.href && (
            <Button
              accent="system"
              href={data.href}
            >List documents</Button>            
          ),
          message: 'You\'re looking for a document that doesn\'t seem to exist.',
          title: 'Oops!'
        }

      case Constants.ERROR_ROUTE_NOT_FOUND:
        return {
          message: 'We couldn\'t find the page you\'re looking for, sorry.',
          title: '404'
        }

      case Constants.STATUS_FAILED:
        return {
          body: (
            <Button
              accent="system"
              href={window.location.pathname}
            >Try again</Button>
          ),
          message: 'The API doesn\'t seem to be responding.',
          title: 'API failure'
        }

      case Constants.API_CONNECTION_ERROR:
        return {
          body: (
            <Button
              accent="system"
              href={window.location.pathname}
            >Try again</Button>
          ),
          message: data.detail || 'The API doesn\'t seem to be responding.',
          title: 'API connection failure'
        }

      default:
        return {
          message: data.message || 'Something went wrong, sorry.',
          title: data.title || 'Oops!'
        }
    }
  }
}
