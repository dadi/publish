import {connectRouter} from 'lib/router'
import Button from 'components/Button/Button'
import DocumentFilters from 'containers/DocumentFilters/DocumentFilters'
import proptypes from 'prop-types'
import React from 'react'
import styles from './DocumentListController.css'

/**
 * A controller bar for a list of documents.
 */
class DocumentListController extends React.Component {
  static propTypes = {
    /**
     * The collection to operate on.
     */
    collection: proptypes.object,

    /**
     * The link to a "Create new" button. If not present, the button will not
     * be rendered.
     */
    createNewHref: proptypes.string,

    /**
     * The ID of the document being operated on.
     */
    documentId: proptypes.string,    

    /**
     * Whether to enable filters.
     */
    enableFilters: proptypes.bool,

    /**
    * A callback to be used to obtain the base URL for the given page, as
    * determined by the view.
    */
    onBuildBaseUrl: proptypes.func,

    /**
     * When selecting a value for a referenced field, this should contain its
     * name.
     */
    referenceFieldName: proptypes.string,

    /**
     * The hash map of search parameters.
     */
    search: proptypes.object
  }

  handleFiltersUpdate(newFilters) {
    const {
      documentId,
      onBuildBaseUrl,
      referenceFieldName,
      router
    } = this.props
    const {history, search} = router
    const newFilterValue = Object.keys(newFilters).length > 0 ?
      newFilters :
      null
    const newSearch = Object.assign({}, search, {
      filter: newFilterValue
    })
    const newUrl = onBuildBaseUrl({
      createNew: Boolean(referenceFieldName && !documentId),
      referenceFieldSelect: referenceFieldName,
      search: newSearch
    })

    history.push(newUrl)
  }

  render() {
    const {
      collection,
      createNewHref,
      enableFilters,
      search = {}
    } = this.props

    if (!collection) {
      return null
    }

    return (
      <div className={styles.wrapper}>
        <div className={styles.filters}>
          {enableFilters &&
            <DocumentFilters
              collection={collection}
              filters={search.filter}
              onUpdateFilters={this.handleFiltersUpdate.bind(this)}
            />
          }
        </div>

        <div className={styles.actions}>
          {createNewHref &&
            <div className={styles['new-button-large']}>
              <Button
                accent="save"
                href={createNewHref}
                type="fill"
              >Create new</Button>
            </div>
          }

          {createNewHref &&
            <div className={styles['new-button-small']}>
              <Button
                accent="save"
                href={createNewHref}
                type="fill"
              >New</Button>
            </div>
          }
        </div>
      </div>
    )
  }
}

export default connectRouter(DocumentListController)