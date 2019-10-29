import DocumentGridList from 'components/DocumentGridList/DocumentGridList'
import {getMediaUrl} from 'lib/util/url'
import MediaGridCard from 'containers/MediaGridCard/MediaGridCard'
import proptypes from 'prop-types'
import React from 'react'

/**
 * Component for rendering API fields of type Media on a reference field select
 * list view.
 */
export default class FieldMediaReferenceSelect extends React.Component {
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
    selectedRows: proptypes.object,

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
    const {config, data, onSelect, selectedRows, selectLimit} = this.props

    return (
      <DocumentGridList
        documents={data}
        onRenderCard={(item, onSelect, isSelected) => {
          const itemWithSrc = Object.assign({}, item, {
            url: getMediaUrl({config, document: item})
          })

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
}
