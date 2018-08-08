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
     * The list of controls to be rendered on the right-hand side of the bar.
     */
    children: proptypes.node
  }

  render() {
    const {children} = this.props

    if (!children.length) return null

    const arrow = ">"
    let groupSpan = null
    if (this.props.groupName) {
      groupSpan = (
        <span class={styles.group}>
          <span>{this.props.groupName} </span>
          <span class={styles.arrow}>{arrow}</span>
        </span>
      )
    }

    return (
      <div class={styles.container}>
        <span>
          {groupSpan}
          <span class={styles.collection}>
            {this.props.collection.name}
          </span>
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
