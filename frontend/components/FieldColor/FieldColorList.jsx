'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './FieldColor.css'

/**
 * Component for rendering API fields of type String on a list view.
 */
export default class FieldColorList extends Component {
  static propTypes = {
    /**
     * App config.
     */
    config: proptypes.object,

    /**
     * The field schema.
     */
    schema: proptypes.object,

    /**
     * The field value.
     */
    value: proptypes.string
  }

  render() {
    const {value} = this.props
    

    return (
      <div class={styles.list}>
        <div 
          class={styles.swatch}
          style={value ? `background-color:#${value}` : ''}
        />
        {value}
      </div>
    )
  }
}
