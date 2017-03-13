'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './ListController.css'

import Button from 'components/Button/Button'
import TextInput from 'components/TextInput/TextInput'

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
     * If truthy, renders a search box with the given text as placeholder.
     */
    search: proptypes.node
  }

  static defaultProps = {
    search: false
  }

  render() {
    const {children, search} = this.props

    return (
      <div class={styles.container}>
        <div>
          {search &&
            <TextInput
              className={styles.search}
              placeholder={search}
              type="search"
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
