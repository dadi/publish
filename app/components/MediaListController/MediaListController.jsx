import Button from 'components/Button/Button'
import DropArea from 'components/DropArea/DropArea'
import FileUpload from 'components/FileUpload/FileUpload'
import proptypes from 'prop-types'
import React from 'react'
import styles from './MediaListController.css'

/**
 * A controller bar for a list of media documents.
 */
export default class MediaListController extends React.Component {
  static propTypes = {
    /**
     * Callback to be fired when the user uploads a document.
     */
    onUpload: proptypes.func
  }

  render() {
    const {onUpload} = this.props

    return (
      <div>
        <DropArea
          className={styles.droparea}
          onDrop={onUpload}
        >
          <div className={styles.wrapper}>
            <p>Drop files to upload</p>

            <span className={styles.separator}>or</span>

            <FileUpload
              multiple={true}
              onChange={onUpload}
            >
              <Button
                accent="data"
                type="mock-stateful"
              >Select files</Button>
            </FileUpload>
          </div>
        </DropArea>
      </div>
    )
  }
}
