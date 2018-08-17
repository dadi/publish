'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './ListController.css'

/**
 * A bar with various types of controls that affect the list of results
 * displayed in a list/table.
 */
export default class ListController extends Component {
  static propTypes = {
    /**
     * An array of strings representing the breadcrumbs to display at the top
     * of the list.
     */
    breadcrumbs: proptypes.array,

    /**
     * The list of controls to be rendered on the right-hand side of the bar.
     */
    children: proptypes.node
  }

  render() {
    const {
      children
    } = this.props

    if (!children.length) return null

    let breadcrumbs = (this.props.breadcrumbs || []).filter(Boolean)

    return (
      <div class={styles.container}>
        <span>
          {(breadcrumbs.length > 1) && breadcrumbs.slice(0, -1).map(node => (
            <span class={styles['breadcrumbs-tail']}>
              <span>{node} </span>
              <span class={styles.arrow}>{'>'}</span>
            </span>
          ))}

          {(breadcrumbs.length > 0) && (
            <span class={styles['breadcrumbs-head']}>
              {breadcrumbs.slice(-1)}
            </span>
          )}
        </span>
        <span>
          {children.map(control => {
            return (
              <div class={styles.control}>
                {control}
              </div>
            )
          })}
        </span>
      </div>
    )
  }
}
