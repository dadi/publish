'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

//import Style from 'lib/Style'
//import styles from './FieldString.css'

/**
 * A list of grouped links.
 */
export default class FieldString extends Component {
  static propTypes = {
    /**
     * The list of child elements to be rendered.
     */
    children: proptypes.node
  }

  render() {
    return (
      <p>String!</p>
    )
  }
}
