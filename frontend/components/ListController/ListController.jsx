'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './ListController.css'

import DocumentSearch from 'components/DocumentSearch/DocumentSearch'

/**
 * A bar with various types of controls that affect the list of results
 * displayed in a list/table.
 */
export default class ListController extends Component {
  static propTypes = {
    /**
     * The list of controls to be rendered on the right-hand side of the bar.
     */
    children: proptypes.node,

    /**
     * The collection being affected by the list controller.
     */
    collection: proptypes.object,

    /**
     * Whether to render a search bar.
     */
    search: proptypes.bool
  }

  constructor(props) {
    super(props)

    this.state.searchValue = ''
  }

  render() {
    const {children, collection, search} = this.props

    return (
      <div class={styles.container}>
        <div>
          {search &&
            <DocumentSearch
              className={styles.search}
              collection={collection}
              value={this.state.searchValue}
            />
          }
        </div>
        <div>
          {children.map(control => {
            return (
              <div class={styles.control}>
                {control}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
}
