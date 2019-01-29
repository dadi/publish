'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import {createRoute} from 'lib/router'
import Style from 'lib/Style'
import styles from './Paginator.css'

import Button from 'components/Button/Button'

/**
 * A generic pagination component.
 */
export default class Paginator extends Component {
  static propTypes = {
    /**
     * Number of the current active page.
     */
    currentPage: proptypes.number.isRequired,

    /**
     * A callback function to be executed in order to generate the page links.
     * This function will receive the page number as an argument.
     */
    linkCallback: proptypes.func.isRequired,

    /**
     * Maximum number of page links to display.
     */
    maxPages: proptypes.number.isRequired,

    /**
     * Whether to render `Prev` and `Next` links.
     */
    prevNext: proptypes.bool.isRequired,

    /**
     * Number of available pages.
     */
    totalPages: proptypes.number.isRequired
  }

  static defaultProps = {
    maxPages: 10,
    prevNext: true
  }

  renderPageNumber(pageNumber, firstPage, lastPage) {
    const {currentPage, linkCallback} = this.props
    const href = linkCallback.call(this, pageNumber)
    const pageStyle = new Style(styles, 'page', 'page-primary')
      .addIf('page-first', pageNumber === currentPage && pageNumber === firstPage)
      .addIf('page-last', pageNumber === currentPage && pageNumber === lastPage)

    if (pageNumber === currentPage) {
      return (
        <Button
          accent="data"
          className={pageStyle.getClasses()}
          type="mock"
        >{pageNumber}</Button>
      )
    }

    return (
      <Button
        href={createRoute({
          path: href,
          update: true
        })}
        className={pageStyle.getClasses()}
      >{pageNumber}</Button>
    )    
  }

  render() {
    const {
      currentPage,
      linkCallback,
      maxPages,
      prevNext,
      totalPages
    } = this.props

    // Return null if required props are invalid.
    if (
      !Number.isInteger(currentPage) ||
      !Number.isInteger(totalPages) ||
      !Number.isInteger(maxPages) ||
      typeof linkCallback !== 'function'
    ) {
      return null
    }

    // The paginator always tries to render an equal number of pages
    // before and after the current page. If the current page is too
    // low or too high for that to happen, we compensate as much as
    // possible on the other end.
    let previousPages = Math.floor((maxPages - 1) / 2)
    let nextPages = Math.ceil((maxPages - 1) / 2)

    // Checking to see if we have enough previous pages to show.
    if (currentPage <= previousPages) {
      const excess = (previousPages - currentPage + 1)
      
      previousPages -= excess
      nextPages += excess
    }

    // Checking to see if we have enough next pages to show.
    if ((currentPage + nextPages) > totalPages) {
      const excess = (currentPage + nextPages) - totalPages
      const previousPagesAllowance = currentPage - 1

      previousPages += Math.min(excess, previousPagesAllowance)
      nextPages -= excess
    }

    let items = []

    let firstPage = Math.max(1, (currentPage - previousPages))
    let lastPage = (currentPage + nextPages)

    for (let i = firstPage; i <= lastPage; i++) {
      items.push(this.renderPageNumber(i, firstPage, lastPage, currentPage))
    }

    const nextUrl = linkCallback(currentPage + 1)
    const prevUrl = linkCallback(currentPage - 1)
    const isFirstPage = currentPage <= 1
    const isLastPage = currentPage >= totalPages
    const nextStyle = new Style(styles, 'page', 'page-secondary')
      .addIf('page-disabled', isLastPage)
    const prevStyle = new Style(styles, 'page', 'page-secondary')
      .addIf('page-disabled', isFirstPage)

    // If there's less than two pages to show, don't show page numbers.
    if (items.length < 2) return null

    return (
      <div>
        {prevNext &&
          <Button
            className={prevStyle.getClasses()}
            disabled={isFirstPage}
            href={createRoute({
              path: prevUrl,
              update: true
            })}
            type={isFirstPage && 'mock'}
          >Prev</Button> 
        }

        {items}

        {prevNext &&
          <Button
            className={nextStyle.getClasses()}
            disabled={isLastPage}
            href={createRoute({
              path: nextUrl,
              update: true
            })}
            type={isLastPage && 'mock'}
          >Next</Button>
        }
      </div>
    )
  }
}
