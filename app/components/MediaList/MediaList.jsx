import * as Constants from 'lib/constants'
import {connectRedux} from 'lib/redux'
import DocumentGridList from 'components/DocumentGridList/DocumentGridList'
import DocumentTableList from 'containers/DocumentTableList/DocumentTableList'
import DropArea from 'components/DropArea/DropArea'
import FieldMediaItem from 'components/FieldMedia/FieldMediaItem'
import MediaGridCard from 'containers/MediaGridCard/MediaGridCard'
import MediaListController from 'components/MediaListController/MediaListController'
import proptypes from 'prop-types'
import React from 'react'

const MEDIA_TABLE_FIELDS = ['url', 'fileName', 'mimeType', 'width', 'height']

class MediaList extends React.Component {
  static propTypes = {
    /**
     * The list of documents shown in the list.
     */
    documents: proptypes.array,

    /**
     * Whether any documents are selected.
     */
    hasSelection: proptypes.bool,

    /**
     * Whether the view is filtered to only show selected documents.
     */
    isFilteringSelection: proptypes.bool,

    /**
     * Whether to display the items in a table or grid form.
     */
    mode: proptypes.oneOf(['table', 'grid']),

    /**
     * Callback to be called to obtain the base URL for the given page, as
     * determined by the view.
     */
    onBuildBaseUrl: proptypes.func,

    /**
     * Callback to be called when the user changes the list display mode.
     */
    onListModeUpdate: proptypes.func,

    /**
     * Callback to be called when files are uploaded.
     */
    onMediaUpload: proptypes.func,

    /**
     * Callback to be called when the selection changes.
     */
    onSelect: proptypes.func,

    /**
     * Callback to be called when the user sorts the list.
     */
    onSort: proptypes.func,

    /**
     * The order used to sort the documents by the `sort` field.
     */
    order: proptypes.oneOf(['asc', 'desc']),

    /**
     * The list of currently selected documents.
     */
    selectedDocuments: proptypes.object,

    /**
     * The name of the field currently being used to sort the documents.
     */
    sort: proptypes.string
  }

  constructor(props) {
    super(props)

    this.renderFieldMediaItem = this.renderFieldMediaItem.bind(this)
  }

  render() {
    const {
      documents,
      hasSelection,
      isFilteringSelection,
      mode,
      onBuildBaseUrl,
      onListModeUpdate,
      onMediaUpload,
      onSelect,
      onSort,
      order,
      selectedDocuments,
      sort
    } = this.props
    const schema = {
      ...Constants.MEDIA_COLLECTION_SCHEMA,
      fields: {
        ...Constants.MEDIA_COLLECTION_SCHEMA.fields,
        url: {label: 'Thumbnail', FieldComponentList: this.renderFieldMediaItem}
      }
    }

    const contents = (
      <>
        {!isFilteringSelection && (
          <MediaListController
            documents={documents}
            mode={mode}
            onListModeUpdate={onListModeUpdate}
            onSelect={onSelect}
            onUpload={onMediaUpload}
            selectedDocuments={selectedDocuments}
          />
        )}

        {mode === 'grid' && (
          <DocumentGridList
            documents={documents}
            onRenderCard={({item, isSelected, onSelect}) => (
              <MediaGridCard
                href={`/media/${item._id}`}
                isSelected={isSelected}
                isSelectMode={hasSelection}
                item={item}
                key={item._id}
                onSelect={onSelect}
              />
            )}
            onSelect={onSelect}
            selectedDocuments={selectedDocuments}
          />
        )}

        {mode === 'table' && (
          <DocumentTableList
            collection={schema}
            documents={documents}
            fields={MEDIA_TABLE_FIELDS}
            onBuildBaseUrl={onBuildBaseUrl}
            onSelect={onSelect}
            onSort={onSort}
            order={order}
            selectedDocuments={selectedDocuments}
            sort={sort}
          />
        )}
      </>
    )

    return onMediaUpload ? (
      <DropArea onDrop={onMediaUpload}>{contents}</DropArea>
    ) : (
      contents
    )
  }

  renderFieldMediaItem({document}) {
    return <FieldMediaItem config={this.props.config} isList value={document} />
  }
}

const mapState = state => ({
  config: state.app.config
})

export default connectRedux(mapState)(MediaList)
