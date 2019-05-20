import {connectRouter} from 'lib/router'
import {Link} from 'react-router-dom'
import DropdownNative from 'components/DropdownNative/DropdownNative'
import Paginator from 'components/Paginator/Paginator'
import proptypes from 'prop-types'
import React from 'react'
import Style from 'lib/Style'
import styles from './DocumentListToolbar.css'
import Toolbar from 'components/Toolbar/Toolbar'
import ToolbarTextInput from 'components/Toolbar/ToolbarTextInput'

/**
 * A toolbar used in a document list view.
 */
class DocumentListToolbar extends React.Component {
  static propTypes = {
    /**
     * The elements to render on the actions part of the toolbar.
     */
    children: proptypes.node,

    /**
     * The metadata block for the current document list.
     */
    documentsMetada: proptypes.object,

    /**
    * A callback used to obtain the URL for a given page.
    */
    onBuildPageUrl: proptypes.func,

    /**
    * The list of selected documents.
    */
    selectedDocuments: proptypes.array,

    /**
    * The URL for limiting the document list to only selected documents.
    */
   showSelectedDocumentsUrl: proptypes.string
  }

  constructor(props) {
    super(props)

    this.state = {
      goToPageValue: ''
    }
  }

  goToPage(value) {
    const {
      documentsMetadata,
      onBuildPageUrl,
      router
    } = this.props
    const parsedValue = Number.parseInt(value)

    if (!documentsMetadata) return null

    // If the input is not a valid positive integer number, we return.
    if ((parsedValue.toString() !== value) || (parsedValue <= 0)) return

    // If the number inserted is outside the range of the pages available,
    // we return.
    if (parsedValue > documentsMetadata.totalPages) return

    const href = onBuildPageUrl(parsedValue)

    router.history.push(href)
  }

  handleGoToPage(event) {
    const {goToPageValue} = this.state

    event.preventDefault()

    this.goToPage(goToPageValue)
  }

  render() {
    const {
      children,
      documentsMetadata: metadata,
      onBuildPageUrl,
      selectedDocuments = [],
      showSelectedDocumentsUrl
    } = this.props
    const {goToPageValue} = this.state

    if (!metadata) return null

    const pagesObject = Array.apply(null, {
      length: metadata.totalPages
    }).reduce((result, content, index) => {
      const page = index + 1

      result[page] = `Page ${page}`
      
      return result
    }, {})
    const selectionCounter = new Style(styles, 'selection-counter')
      .addIf('selection-counter-visible', selectedDocuments.length > 0)

    return (
      <Toolbar>      
        {metadata.totalCount > 0 && (
          <div className={styles.section}>
            <span className={styles['count-label']}>
              <strong>{`${metadata.offset + 1}-${Math.min(metadata.offset + metadata.limit, metadata.totalCount)} `}</strong>
              of <strong>{metadata.totalCount}</strong>

              {showSelectedDocumentsUrl && (
                <span className={selectionCounter.getClasses()}>
                  (
                    <Link
                      className={styles['selection-counter-button']}
                      to={showSelectedDocumentsUrl}
                    >
                      {selectedDocuments.length} selected
                    </Link>
                  )
                </span>
              )}
            </span>
          </div>
        )}

        {metadata.totalCount > metadata.limit && (
          <div className={`${styles.section} ${styles['section-pagination']}`}>
            <Paginator
              currentPage={metadata.page}
              linkCallback={page => onBuildPageUrl(page)}
              maxPages={8}
              totalPages={metadata.totalPages}
            />

            <div className={styles.information}>
              <div>
                <span className={`${styles['page-input']} ${styles['page-input-simple']}`}>
                  <form onSubmit={this.handleGoToPage.bind(this)}>
                    <ToolbarTextInput
                      onChange={event => {
                        const {value} = event.target
                        const parsedValue = Number.parseInt(value)

                        if (
                          value === '' ||
                          (parsedValue.toString() === value && value > 0)
                        ) {
                          this.setState({
                            goToPageValue: value
                          })                        
                        }
                      }}
                      size="small"
                      placeholder="Go to page"
                      value={goToPageValue}
                    />
                  </form>
                </span>

                <span className={`${styles['page-input']} ${styles['page-input-extended']}`}>
                  <DropdownNative
                    onChange={this.goToPage.bind(this)}
                    options={pagesObject}
                    value={metadata.page}
                  />
                </span>
              </div>
            </div>
          </div>
        )}

        <div className={styles.section}>
          {children}
        </div>
      </Toolbar>
    )
  }
}

export default connectRouter(DocumentListToolbar)