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
     * Whether to enable filters.
     */
    enableFilters: proptypes.bool,

    /**
     * The set of filters applied.
     */
    filters: proptypes.object,

    /**
    * A callback to be fired whenever the filters are changed.
    */
    onUpdateFilters: proptypes.func
  }

  static defaultProps = {
    filters: {}
  }

  render() {
    const {
      collection,
      createNewHref,
      enableFilters,
      filters,
      onUpdateFilters
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
              filters={filters}
              onUpdateFilters={onUpdateFilters}
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