'use strict'

import {h, Component} from 'preact'
import {route} from '@dadi/preact-router'
import Button from 'components/Button/Button'
import DocumentFilters from 'components/DocumentFilters/DocumentFilters'
import ListController from 'components/ListController/ListController'
import proptypes from 'proptypes'
import Style from 'lib/Style'
import styles from './DocumentListController.css'

/**
 * A controller bar for a list of documents.
 */
export default class DocumentListController extends Component {
  static propTypes = {
    /**
     * The collection to operate on.
     */
    collection: proptypes.object,

    /**
    * A callback to be used to obtain the base URL for the given page, as
    * determined by the view.
    */
    onBuildBaseUrl: proptypes.func,

    /**
     * The hash map of search parameters.
     */
    search: proptypes.object
  }

  render() {
    const {
      api,
      collection,
      group,
      onBuildBaseUrl,
      referencedField,
      search = {}
    } = this.props
    const newHref = onBuildBaseUrl({
      createNew: true,
      search: null
    })

    if (!collection) {
      return null
    }

    return (
      <div class={styles.wrapper}>
        <div class={styles.filters}>
          <DocumentFilters
            collection={collection}
            filters={search.filter}
            onUpdateFilters={this.handleFiltersUpdate.bind(this)}
          />
        </div>

        <div class={styles.actions}>
          <Button
            accent="save"
            href={newHref}
            type="fill"
          >Create new</Button>
        </div>
      </div>
    )
  }

  handleGoToPage(event) {
    const {onBuildBaseUrl} = this.props
    const inputValue = event.target.value
    const parsedValue = parseInt(inputValue)

    // If the input is not a valid positive integer number, we return.
    if ((parsedValue.toString() !== inputValue) || (parsedValue <= 0)) return

    // If the number inserted is outside the range of the pages available,
    // we return.
    if (parsedValue > metadata.totalPages) return

    let url = onBuildBaseUrl({
      page: parsedValue
    })

    route(url)
  }

  handleFiltersUpdate(newFilters) {
    const {onBuildBaseUrl, search} = this.props
    const newFilterValue = Object.keys(newFilters).length > 0 ?
      newFilters :
      null
    const newSearch = Object.assign({}, search, {
      filter: newFilterValue
    })
    const newUrl = onBuildBaseUrl({
      search: newSearch
    })

    route(newUrl)
  }
}
