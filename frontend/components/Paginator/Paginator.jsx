'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

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
    currentPage: proptypes.number,

    /**
     * A callback function to be executed in order to generate the page links.
     * This function will receive the page number as an argument.
     */
    linkCallback: proptypes.func,

    /**
     * Maximum number of page links to display.
     */
    maxPages: proptypes.number,

    /**
     * Whether to render `Next` and `Last` links.
     */
    nextLast: proptypes.bool,

    /**
     * Number of available pages.
     */
    totalPages: proptypes.number
  }

  static defaultProps = {
    maxPages: 10,
    nextLast: true
  }

  renderPageNumber(pageNumber) {
    const {currentPage, linkCallback} = this.props
    const href = typeof linkCallback === 'function' ? linkCallback.call(this, pageNumber) : null
    const activePageStyle = new Style(styles, 'page', 'page-active')

    if (pageNumber === currentPage) {
      return (
        <Button
          accent="data"
          className={styles.page}
          type="mock"
        >{pageNumber}</Button>
      )
    }

    return (
      <Button
        href={href}
        className={styles.page}
      >{pageNumber}</Button>
    )    
  }

  render() {
    const {
      currentPage,
      linkCallback,
      maxPages,
      nextLast,
      totalPages
    } = this.props

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

    for (let i = (currentPage - previousPages); i <= (currentPage + nextPages); i++) {
      items.push(this.renderPageNumber(i))
    }

    const nextUrl = (typeof linkCallback === 'function') && linkCallback(currentPage + 1)
    const lastUrl = (typeof linkCallback === 'function') && linkCallback(totalPages)
    const nextLastStyle = new Style(styles, 'page', 'page-secondary')

    // If there's less than two pages to show, there's really no point in showing
    // the page numbers.
    if (items.length < 2) return null

    return (
      <div>
        {items}

        {nextLast && (currentPage < totalPages) &&
          <Button
            className={nextLastStyle.getClasses()}
            href={nextUrl}
          >Next</Button>
        }

        {nextLast && (currentPage < (totalPages - 1)) &&
          <Button
            className={nextLastStyle.getClasses()}
            href={lastUrl}
          >Last</Button>
        }
      </div>
    )
  }
}
