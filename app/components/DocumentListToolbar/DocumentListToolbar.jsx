import {Select, TextInput} from '@dadi/edit-ui'
import proptypes from 'prop-types'
import React from 'react'
import Style from 'lib/Style'
import styles from './DocumentListToolbar.css'
import Toolbar from 'components/Toolbar/Toolbar'

function range(from, to) {
  return from >= to
    ? []
    : Array(to - from + 1)
        .fill(0)
        .map((el, i) => from + i)
}

/**
 * A toolbar used in a document list view.
 */
export default class DocumentListToolbar extends React.Component {
  static propTypes = {
    /**
     * The elements to render on the actions part of the toolbar.
     */
    children: proptypes.node,

    /**
     * The metadata object for the document list.
     */
    metadata: proptypes.object,

    /**
     * A callback which will be called with the new page number when
     * the user navigates to a new page.
     */
    onPageChange: proptypes.func,

    /**
     * The list of selected documents.
     */
    selectedDocuments: proptypes.array,

    /**
     * Callback for limiting the document list to only selected documents.
     */
    showSelectedDocuments: proptypes.func
  }

  constructor(props) {
    super(props)

    this.goToPrev = this.goToPrev.bind(this)
    this.goToPage = this.goToPage.bind(this)
    this.goToNext = this.goToNext.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleInputKeyDown = this.handleInputKeyDown.bind(this)

    this.state = {
      goToPageValue: ''
    }
  }

  goToNext() {
    this.goToPage(this.props.metadata.page + 1)
  }

  goToPage(value) {
    const {metadata, onPageChange} = this.props
    const parsedValue = parseInt(value)

    if (
      metadata &&
      typeof onPageChange === 'function' &&
      parsedValue <= metadata.totalPages
    ) {
      this.setState({goToPageValue: ''})
      onPageChange(parsedValue)
    }
  }

  goToPrev() {
    this.goToPage(this.props.metadata.page - 1)
  }

  handleInputChange({target: {value}}) {
    const parsedValue = parseInt(value)

    if (value === '' || (parsedValue.toString() === value && parsedValue > 0)) {
      this.setState({goToPageValue: value})
    }
  }

  handleInputKeyDown({key, target: {value}}) {
    if (key === 'Enter') {
      this.goToPage(value)
    }
  }

  render() {
    const {
      children,
      metadata,
      selectedDocuments = [],
      showSelectedDocuments
    } = this.props

    if (!metadata) return null

    const {limit, offset, page, totalCount, totalPages} = metadata
    const {goToPageValue} = this.state

    const currentPageMin = (offset + 1).toLocaleString()
    const currentPageMax = Math.min(offset + limit, totalCount).toLocaleString()
    const numTotalDocuments = totalCount.toLocaleString()
    const numSelectedDocuments = selectedDocuments.length.toLocaleString()

    const pagesAroundCurrent = 2 // In each direction.
    const ellipsisBefore = page > 2 + pagesAroundCurrent
    const ellipsisAfter = page < totalPages - pagesAroundCurrent - 1
    const displayedPages = range(
      Math.max(
        2,
        Math.min(page, totalPages - pagesAroundCurrent) - pagesAroundCurrent
      ),
      Math.min(
        totalPages - 1,
        Math.max(page, pagesAroundCurrent + 1) + pagesAroundCurrent
      )
    )

    const pageNumberElement = num => (
      <button
        className={new Style(styles, 'page-number')
          .addIf('current', page === num)
          .getClasses()}
        key={num}
        onClick={() => this.goToPage(num)}
      >
        {num}
      </button>
    )

    const selectPageOptions = []

    for (let page = 1; page <= metadata.totalPages; page++) {
      selectPageOptions.push({
        label: `Page ${page}`,
        onClick: () => this.goToPage(page)
      })
    }

    return (
      <Toolbar>
        {totalCount > 0 && (
          <div className={styles.section}>
            <span className={styles.count}>
              <strong>
                {currentPageMin}–{currentPageMax}
              </strong>{' '}
              of <strong>{numTotalDocuments}</strong>{' '}
              {showSelectedDocuments && selectedDocuments.length > 0 && (
                <span>
                  (
                  <a
                    className={styles['selected-count']}
                    onClick={showSelectedDocuments}
                  >
                    {numSelectedDocuments} selected
                  </a>
                  )
                </span>
              )}
            </span>
          </div>
        )}

        {totalCount > limit && (
          <div className={styles.section}>
            <div className={styles['page-numbers']}>
              {totalPages > 9 ? (
                <>
                  {pageNumberElement(1)}
                  {ellipsisBefore && <div className={styles.ellipsis}>…</div>}
                  {displayedPages.map(pageNumberElement)}
                  {ellipsisAfter && <div className={styles.ellipsis}>…</div>}
                  {pageNumberElement(totalPages)}
                </>
              ) : (
                range(1, totalPages).map(pageNumberElement)
              )}
            </div>

            <button
              className={styles['page-button']}
              disabled={page === 1}
              onClick={this.goToPrev}
            >
              <i className="material-icons" id={styles['prev-icon']}>
                expand_more
              </i>
            </button>

            <div className={styles['page-select']}>
              <Select
                dir="up"
                options={selectPageOptions}
                label={`Page ${page}`}
              />
            </div>

            <button
              className={styles['page-button']}
              disabled={page === totalPages}
              onClick={this.goToNext}
            >
              <i className="material-icons" id={styles['next-icon']}>
                expand_more
              </i>
            </button>

            <div className={styles['page-input']}>
              <TextInput
                onChange={this.handleInputChange}
                onKeyDown={this.handleInputKeyDown}
                placeholder="Go to page…"
                simple
                value={goToPageValue}
              />
            </div>
          </div>
        )}

        <div className={styles.section}>{children}</div>
      </Toolbar>
    )
  }
}
