'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import {debounce} from 'lib/util'

import Style from 'lib/Style'
import styles from './FieldMediaReferenceSelect.css'

import DocumentGridList from 'components/DocumentGridList/DocumentGridList'
import MediaGridCard from 'components/MediaGridCard/MediaGridCard'

/**
 * Component for rendering API fields of type Media on a reference field select
 * list view.
 */
export default class FieldMediaReferenceSelect extends Component {
  static propTypes = {
    /**
     * A subset of the app config containing data specific to this field type.
     */
    config: proptypes.object,

    /**
     * The available documents..
     */
    data: proptypes.array,

    /**
     * The callback to be fired when a document is selected.
     */
    onSelect: proptypes.func,

    /**
     * The callback to be fired when the sort parameters are changed.
     */
    onSort: proptypes.func,

    /**
     * A hash map of the indices of the currently selected rows.
     */
    selectedRows: proptypes.obj,

    /**
     * The maximum number of documents that can be selected.
     */
    selectLimit: proptypes.number,

    /**
     * The name of the field to sort documents by.
     */
    sortBy: proptypes.string,

    /**
     * The order used to sort the documents by the `sortBy` field.
     */
    sortOrder: proptypes.oneOf(['asc', 'desc'])
  }

  render() {
    const {
      data,
      onSelect,
      selectedRows,
      selectLimit
    } = this.props

    return (
      <DocumentGridList
        documents={data}
        onRenderCard={(item, onSelect, isSelected) => {
          let itemWithSrc = Object.assign(
            {},
            item,
            {url: this.getImageSrc(item)}
          )

          return (
            <MediaGridCard
              item={itemWithSrc}
              isSelected={isSelected}
              onSelect={onSelect}
            />
          )
        }}
        onSelect={onSelect}
        selectedDocuments={selectedRows}
        selectLimit={selectLimit}
      />
    )
  }

  getImageSrc(value) {
    const {config} = this.props
    const cdn = config ? config.cdn : null

    // If the value is null, there's nothing to render.
    if (!value) return null

    // If the value contains raw image data, let's render
    // that.
    if (value._previewData) return value._previewData

    // If there is an instance of CDN configured, we take
    // the `path` property and append it to the CDN URL.
    if (cdn && cdn.publicUrl && value.path) {
      return `${cdn.publicUrl}${value.path}?width=500`
    }

    return value.url || null
  }
}
