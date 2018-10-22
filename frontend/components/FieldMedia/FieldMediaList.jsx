'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import FieldMediaItem from './FieldMediaItem'
import styles from './FieldMedia.css'

export default class FieldMediaList extends Component { 
  static propTypes = {
    /**
     * The name of the collection being edited, as per the URL.
     */
    collection: proptypes.string,

    /**
     * The schema of the API being used.
     */
    currentApi: proptypes.object,

    /**
     * The field value.
     */
    value: proptypes.string,

    /**
     * The field schema.
     */
    schema: proptypes.object
  }

  constructor(props) {
    super(props)
  }

  render() {
    const {config, value} = this.props
    const values = (value && !Array.isArray(value)) ? [value] : value
    const multiple = values && values.length > 1

    return (
      <div>
        {values &&
          <div class={styles.thumbnails}>
            <FieldMediaItem
              config={config}
              isList={true}
              value={values[0]}
            />

            {multiple &&
              (<div>and {values.length - 1} more</div>)
            }
          </div>
        }
      </div>
    )
  }
}
