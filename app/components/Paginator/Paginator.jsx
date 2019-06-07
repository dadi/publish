import React from 'react'
import Button from 'components/Button/Button'
import proptypes from 'prop-types'
import Style from 'lib/Style'
import styles from './Paginator.css'

/**
 * A generic pagination component.
 */
export default class Paginator extends React.Component {
  static propTypes = {
    /**
     * Number of the current active page.
     */
    currentPage: proptypes.number.isRequired,

    /**
     * Maximum number of page links to display.
     */
    maxPages: proptypes.number.isRequired,

    /**
     * A callback used to determine what should happen when the user attempts
     * to select a specific page. This function will be called with a single
     * argument, which is the number of the page to navigate to. It can return
     * either a string, which is infered as an `href` property for a `<a>` tag,
     * or it can return a function, which will be attached to the `onClick`
     * event of a `<button>` tag.
     */
    pageChangeHandler: proptypes.func,

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

  getPropValuePair(pageNumber) {
    const {pageChangeHandler} = this.props

    if (typeof pageChangeHandler === 'function') {
      const value = pageChangeHandler(pageNumber)

      if (typeof value === 'string') {
        return {
          href: value
        }
      }

      if (typeof value === 'function') {
        return {
          onClick: value.bind(this, pageNumber)
        }
      }
    }

    return null
  }

  render() {
    const {currentPage, maxPages, prevNext, totalPages} = this.props

    // The paginator always tries to render an equal number of pages
    // before and after the current page. If the current page is too
    // low or too high for that to happen, we compensate as much as
    // possible on the other end.
    let previousPages = Math.floor((maxPages - 1) / 2)
    let nextPages = Math.ceil((maxPages - 1) / 2)

    // Checking to see if we have enough previous pages to show.
    if (currentPage <= previousPages) {
      const excess = previousPages - currentPage + 1

      previousPages -= excess
      nextPages += excess
    }

    // Checking to see if we have enough next pages to show.
    if (currentPage + nextPages > totalPages) {
      const excess = currentPage + nextPages - totalPages
      const previousPagesAllowance = currentPage - 1

      previousPages += Math.min(excess, previousPagesAllowance)
      nextPages -= excess
    }

    const firstPage = Math.max(1, currentPage - previousPages)
    const lastPage = currentPage + nextPages

    let items = []

    for (let i = firstPage; i <= lastPage; i++) {
      items.push(this.renderPageNumber(i, firstPage, lastPage, currentPage))
    }

    const isFirstPage = currentPage <= 1
    const isLastPage = currentPage >= totalPages
    const nextStyle = new Style(styles, 'page', 'page-secondary').addIf(
      'page-disabled',
      isLastPage
    )
    const prevStyle = new Style(styles, 'page', 'page-secondary').addIf(
      'page-disabled',
      isFirstPage
    )

    // If there's less than two pages to show, don't show page numbers.
    if (items.length < 2) return null

    return (
      <div>
        {prevNext && (
          <Button
            {...this.getPropValuePair(currentPage - 1)}
            className={prevStyle.getClasses()}
            disabled={isFirstPage}
            type={isFirstPage ? 'mock' : undefined}
          >
            Prev
          </Button>
        )}

        {items}

        {prevNext && (
          <Button
            {...this.getPropValuePair(currentPage + 1)}
            className={nextStyle.getClasses()}
            disabled={isLastPage}
            type={isLastPage ? 'mock' : undefined}
          >
            Next
          </Button>
        )}
      </div>
    )
  }

  renderPageNumber(pageNumber, firstPage, lastPage) {
    const {currentPage} = this.props
    const pageStyle = new Style(styles, 'page', 'page-primary')
      .addIf(
        'page-first',
        pageNumber === currentPage && pageNumber === firstPage
      )
      .addIf('page-last', pageNumber === currentPage && pageNumber === lastPage)

    if (pageNumber === currentPage) {
      return (
        <Button
          accent="data"
          className={pageStyle.getClasses()}
          key={pageNumber}
          type="mock"
        >
          {pageNumber}
        </Button>
      )
    }

    return (
      <Button
        {...this.getPropValuePair(pageNumber)}
        className={pageStyle.getClasses()}
        key={pageNumber}
      >
        {pageNumber}
      </Button>
    )
  }
}
