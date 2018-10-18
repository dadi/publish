'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import {bindActionCreators} from 'redux'
import {connectHelper} from 'lib/util'

import Style from 'lib/Style'
import styles from './FileUploadMedia.css'

import * as mediaActions from 'actions/mediaActions'

import DropArea from 'components/DropArea/DropArea'
import FileUpload from 'components/FileUpload/FileUpload'

class FileUploadMedia extends Component {

  static propTypes = {
    /** 
     * The global actions object
     */
    actions: proptypes.object,
    /**
     * The current bucket object
     */
    bucket: proptypes.object,
  }

  render() {
    return (
      <div class={styles.placeholder}>
        <div class={styles['upload-options']}>
          <DropArea
            draggingText={`Drop image(s) here`}
            onDrop={this.handleFileChange.bind(this)}
          >
            <div class={styles['upload-drop']}>
              Drop file(s) to upload
            </div>
          </DropArea>
        </div>

        <div class={styles['upload-select']}>
          <span>or </span>

          <FileUpload
            accept="image/*;capture=camera"
            allowDrop={true}
            multiple={true}
            onChange={this.handleFileChange.bind(this)}
          />
        </div>
      </div>
    )
  }
  
  handleFileChange(files) {
    const {
      actions: {
        uploadMediaToBucket
      },
      bucket,
      state
    } = this.props

    uploadMediaToBucket(
      {
        api: state.api.apis[0],
        bucket,
        files
      }
    )
  }
}

export default connectHelper(
  state => ({
    api: state.api
  }),
  dispatch => bindActionCreators({
    ...mediaActions
  }, dispatch)
)(FileUploadMedia)
