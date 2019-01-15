'use strict'

import {h, Component} from 'preact'
import {route} from '@dadi/preact-router'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './DocumentListToolbar.css'

import * as Constants from 'lib/constants'

import Checkbox from 'components/Checkbox/Checkbox'
import DropdownNative from 'components/DropdownNative/DropdownNative'
import Paginator from 'components/Paginator/Paginator'
import Toolbar from 'components/Toolbar/Toolbar'
import ToolbarTextInput from 'components/Toolbar/ToolbarTextInput'

/**
 * A toolbar used in a document list view.
 */
export default class DocumentListToolbar extends Component {
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
    * A callback to be used to obtain the URL for a given page.
    */
    onBuildPageUrl: proptypes.func
  }

  goToPage(value) {
    const {
      documentsMetadata,
      onBuildPageUrl
    } = this.props
    const parsedValue = parseInt(value)

    if (!documentsMetadata) return null

    // If the input is not a valid positive integer number, we return.
    if ((parsedValue.toString() !== value) || (parsedValue <= 0)) return

    // If the number inserted is outside the range of the pages available,
    // we return.
    if (parsedValue > documentsMetadata.totalPages) return

    let href = onBuildPageUrl(parsedValue)

    route(href)
  }

  render() {
    const {
      children,
      documentsMetadata: metadata,
      onBuildPageUrl
    } = this.props

    if (!metadata) return null

    const pagesObject = Array.apply(null, {
      length: metadata.totalPages
    }).reduce((result, content, index) => {
      const page = index + 1

      result[page] = `Page ${page}`
      
      return result
    }, {})

    return (
      <Toolbar>      
        {metadata.totalCount > 1 && (
          <div class={styles.section}>
            <span class={styles['count-label']}>
              <span>Showing </span>
              <strong>{`${metadata.offset + 1}-${Math.min(metadata.offset + metadata.limit, metadata.totalCount)} `}</strong>
              of <strong>{metadata.totalCount}</strong>
            </span>
          </div>
        )}

        {metadata.totalCount > metadata.limit && (
          <div class={`${styles.section} ${styles['section-pagination']}`}>
            <Paginator
              currentPage={metadata.page}
              linkCallback={page => onBuildPageUrl(page)}
              maxPages={8}
              totalPages={metadata.totalPages}
            />

            <div class={styles.information}>
              <div>
                <span class={`${styles['page-input']} ${styles['page-input-simple']}`}>
                  <ToolbarTextInput
                    onChange={event => goToPage.bind(event.target.value)}
                    size="small"
                    placeholder="Go to page"
                  />
                </span>

                <span class={`${styles['page-input']} ${styles['page-input-extended']}`}>
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

        <div class={styles.section}>
          {children}
        </div>
      </Toolbar>
    )
  }
}
