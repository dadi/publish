'use strict'

import {h, Component} from 'preact'
import {route} from '@dadi/preact-router'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './DocumentListToolbar.css'

import * as Constants from 'lib/constants'

import Checkbox from 'components/Checkbox/Checkbox'
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

  handleGoToPage(event) {
    const {
      documentsMetadata,
      onBuildPageUrl
    } = this.props
    const inputValue = event.target.value
    const parsedValue = parseInt(inputValue)

    if (!documentsMetadata) return null

    // If the input is not a valid positive integer number, we return.
    if ((parsedValue.toString() !== inputValue) || (parsedValue <= 0)) return

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
        <div class={`${styles.section} ${styles['section-pagination']}`}>
          <Paginator
            currentPage={metadata.page}
            linkCallback={page => onBuildPageUrl(page)}
            maxPages={8}
            totalPages={metadata.totalPages}
          />

          <div class={styles.information}>
            {metadata.totalCount > metadata.limit && (
              <div>
                <span class={`${styles['page-input']} ${styles['page-input-simple']}`}>
                  <ToolbarTextInput
                    onChange={this.handleGoToPage.bind(this)}
                    size="small"
                    placeholder="Go to page"
                    type="number"
                  />
                </span>

                <span class={`${styles['page-input']} ${styles['page-input-extended']}`}>
                  <ToolbarTextInput
                    onChange={this.handleGoToPage.bind(this)}
                    size="small"
                    placeholder={`Page ${metadata.page}`}
                    type="number"
                  />
                </span>
              </div>
            )} 
          </div>
        </div>

        <div class={styles.section}>
          {children}
        </div>
      </Toolbar>
    )
  }
}
