'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './DocumentEditToolbar.css'

import Button from 'components/Button/Button'
import ButtonWithOptions from 'components/ButtonWithOptions/ButtonWithOptions'
import DateTime from 'components/DateTime/DateTime'
import Peer from 'components/Peer/Peer'
import Toolbar from 'components/Toolbar/Toolbar'

/**
 * A toolbar used in a document list view.
 */
export default class DocumentListToolbar extends Component {
  static propTypes = {
    /**
     * The document currently being edited.
     */
    document: proptypes.object,

    /**
     * Whether the app is experiencing network connection issues.
     */
    hasConnectionIssues: proptypes.bool,

    /**
     * Whether the document currently being edited has any validation errors.
     */
    hasValidationErrors: proptypes.bool,

    /**
     * Whether the interface is editing an existing document or creating
     * a new one.
     */
    method: proptypes.oneOf(['edit', 'new']),

    /**
     * A callback to be fired when the "Save" button is pressed.
     */
    onSave: proptypes.func,

    /**
     * An array of peers currently editing the document.
     */
    peers: proptypes.object
  }

  constructor(props) {
    super(props)
  }

  render() {
    const {
      document,
      hasConnectionIssues,
      hasValidationErrors,
      method,
      peers
    } = this.props

    // By default, we support these two save modes.
    let saveOptions = {
      'Save and create new': this.handleSave.bind(this, 'saveAndCreateNew'),
      'Save and go back': this.handleSave.bind(this, 'saveAndGoBack')
    }

    // If we're editing an existing document, we also allow users to duplicate
    // the document.
    if (method === 'edit') {
      saveOptions['Save as duplicate'] = this.handleSave.bind(this, 'saveAsDuplicate')
    }

    return (
      <Toolbar>
        {peers && (peers.length > 0) &&
          <div class={styles.peers}>
            {peers.map(peer => (
              <Peer peer={peer} />
            ))}
          </div>
        }

        <div class={styles.metadata}>
          {document.createdAt &&
            <p>
              <span>Created </span>
              <DateTime
                date={document.createdAt}
                relative={true}
              />
            </p>
          }

          {document.lastModifiedAt &&
            <p class={styles['metadata-emphasis']}>
              <span>Last updated </span>
              <DateTime
                date={document.lastModifiedAt}
                relative={true}
              />
            </p>
          }
        </div>

        <div class={styles.buttons}>
          <div class={styles.button}>
            <Button
              accent="destruct"
              className={styles.button}
              disabled={hasConnectionIssues}
            >Delete</Button> 
          </div>

          <div class={styles.button}>
            <ButtonWithOptions
              accent="save"
              disabled={hasConnectionIssues || hasValidationErrors}
              onClick={this.handleSave.bind(this, 'save')}
              options={saveOptions}
            >
              Save and continue
            </ButtonWithOptions>
          </div>
        </div>
      </Toolbar>
    )
  }

  handleSave(saveMethod) {
    const {onSave} = this.props

    if (typeof onSave === 'function') {
      onSave(saveMethod)
    }
  }
}
