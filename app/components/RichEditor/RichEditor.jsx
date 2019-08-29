import * as Constants from 'lib/constants'
import {RichEditorToolbar, RichEditorToolbarButton} from './RichEditorToolbar'
import Button from 'components/Button/Button'
import DocumentFilters from 'containers/DocumentFilters/DocumentFilters'
import DocumentGridList from 'components/DocumentGridList/DocumentGridList'
import DocumentList from 'containers/DocumentList/DocumentList'
import DocumentListToolbar from 'components/DocumentListToolbar/DocumentListToolbar'
import {Editor} from 'slate-react'
import Fullscreen from 'components/Fullscreen/Fullscreen'
import HeroMessage from 'components/HeroMessage/HeroMessage'
import HotKeys from 'lib/hot-keys'
import IconBold from './icons/bold.svg'
import IconBulletedList from './icons/bulleted-list.svg'
import IconCode from './icons/code.svg'
import IconFullscreen from './icons/fullscreen.svg'
import IconH1 from './icons/header1.svg'
import IconH2 from './icons/header2.svg'
import IconItalic from './icons/italic.svg'
import IconLink from './icons/link.svg'
import IconMedia from './icons/image.svg'
import IconNumberedList from './icons/numbered-list.svg'
import IconQuote from './icons/quote.svg'
import IconText from './icons/text.svg'
import MarkdownSerializer from '@edithq/slate-md-serializer'
import MediaGridCard from 'containers/MediaGridCard/MediaGridCard'
import Modal from 'components/Modal/Modal'
import PlainSerializer from 'slate-plain-serializer'
import proptypes from 'prop-types'
import React from 'react'
import RichEditorLink from './RichEditorLink'
import Style from 'lib/Style'
import styles from './RichEditor.css'
import {Value} from 'slate'

const DEFAULT_NODE = 'paragraph'
const EMPTY_VALUE = {
  document: {
    nodes: [
      {
        object: 'block',
        type: 'line',
        nodes: [
          {
            object: 'text',
            text: ''
          }
        ]
      }
    ]
  }
}
const FORMAT_MARKDOWN = 'markdown'
const NODE_BLOCKQUOTE = 'block-quote'
const NODE_BOLD = 'bold'
const NODE_CODE = 'code'
const NODE_HEADING1 = 'heading1'
const NODE_HEADING2 = 'heading2'
const NODE_ITALIC = 'italic'
const NODE_IMAGE = 'image'
const NODE_LINK = 'link'
const NODE_BULLETED_LIST = 'bulleted-list'
const NODE_NUMBERED_LIST = 'ordered-list'
const NODE_LIST_ITEM = 'list-item'
const SCHEMA = {
  blocks: {
    image: {
      isVoid: true
    }
  }
}

/**
 * A rich text editor.
 */
export default class RichEditor extends React.Component {
  static propTypes = {
    /**
     * The content of the editor.
     */
    children: proptypes.node,

    /**
     * The unique cache key for the document being edited.
     */
    contentKey: proptypes.string,

    /**
     * The format used for input and output.
     */
    format: proptypes.oneOf(['markdown']),

    /**
     * Callback to be executed when the text loses focus (onBlur event).
     */
    onBlur: proptypes.func,

    /**
     * A callback function that is fired whenever the content changes.
     */
    onChange: proptypes.func,

    /**
     * A callback to be fired when the components mounts, in case it wishes to
     * register an `onSave` callback with the store. That callback is then
     * fired before the field is saved, allowing the function to modify its
     * value before it is persisted.
     */
    onSaveRegister: proptypes.func,

    /**
     * A callback to be fired when the components mounts, in case it wishes to
     * register an `onValidate` callback with the store. That callback is then
     * fired when the field is validated, overriding the default validation
     * method introduced by the API validator module.
     */
    onValidateRegister: proptypes.func,

    /**
     * The initial value of the editor.
     */
    value: proptypes.oneOfType([proptypes.object, proptypes.string])
  }

  constructor(props) {
    super(props)

    this.hotKeys = new HotKeys({
      escape: this.handleToggleFullscreen.bind(this, false),
      'mod+b': this.handleToggleMark.bind(this, 'bold'),
      'mod+i': this.handleToggleMark.bind(this, 'italic')
    })

    this.initialMediaState = {
      isSelectingMedia: false,
      mediaFilters: {},
      mediaPage: 1,
      mediaSelection: []
    }

    this.markdown = new MarkdownSerializer()

    this.state = {
      ...this.initialMediaState,
      isFocused: false,
      isFullscreen: false,
      isRawMode: false
    }
  }

  componentDidMount() {
    const {onSaveRegister, onValidateRegister} = this.props
    const {bottom, left, right, top} = this.container.getBoundingClientRect()

    this.containerBounds = {bottom, left, right, top}
    this.hotKeys.addListener()

    if (typeof onSaveRegister === 'function') {
      onSaveRegister(this.handleSave.bind(this))
    }

    if (typeof onValidateRegister === 'function') {
      onValidateRegister(this.validate.bind(this))
    }
  }

  componentDidUpdate(_, prevState) {
    if (this.state.isFullscreen !== prevState.isFullscreen) {
      this.containerBounds = this.container.getBoundingClientRect()
    }
  }

  componentWillMount() {
    this.hotKeys.removeListener()
  }

  deserialise(value) {
    const {format} = this.props
    const {isRawMode} = this.state

    if (Value.isValue(value)) {
      return value
    }

    if (typeof value === 'string') {
      if (!isRawMode && format === FORMAT_MARKDOWN) {
        return this.markdown.deserialize(value)
      }

      return PlainSerializer.deserialize(value)
    }

    return Value.fromJSON(value || EMPTY_VALUE)
  }

  handleChange({value}) {
    const {onChange} = this.props
    const {isFocused} = value.selection

    if (this.state.isFocused !== isFocused) this.setState({isFocused})

    onChange.call(this, value)
  }

  handleLinkClick(node, currentHref, event) {
    event.preventDefault()

    const newHref = this.openLinkPrompt(currentHref)

    return this.handleLinkUpdate(node, newHref)
  }

  handleLinkUpdate(node, href) {
    if (href === '') {
      return this.editor.unwrapInlineByKey(node.key, NODE_LINK)
    }

    this.editor.setNodeByKey(node.key, {
      data: {href}
    })
  }

  handleMediaInsert() {
    const {isRawMode, mediaSelection} = this.state

    this.setState({...this.initialMediaState}, () => {
      mediaSelection.forEach(mediaObject => {
        if (!mediaObject.url) return

        if (isRawMode) {
          return this.editor.insertText(`![](${mediaObject.url})`)
        }

        this.editor.insertBlock({
          type: 'image',
          data: {
            src: mediaObject.url
          }
        })
      })

      this.editor.insertBlock('p')
    })
  }

  handleSave({value}) {
    return this.serialise(value)
  }

  handleToggleBlock(type) {
    if (this.state.isRawMode) {
      return
    }

    if (type !== NODE_BULLETED_LIST && type !== NODE_NUMBERED_LIST) {
      const isActive = this.hasBlock(type)
      const isList = this.hasBlock(NODE_LIST_ITEM)

      if (isList) {
        this.editor
          .setBlocks(isActive ? DEFAULT_NODE : type)
          .unwrapBlock(NODE_BULLETED_LIST)
          .unwrapBlock(NODE_NUMBERED_LIST)
      } else {
        this.editor.setBlocks(isActive ? DEFAULT_NODE : type)
      }
    } else {
      const {document} = this.value
      const isList = this.hasBlock(NODE_LIST_ITEM)
      const isType = this.value.blocks.some(block => {
        return Boolean(
          document.getClosest(block.key, parent => parent.type === type)
        )
      })

      if (isList && isType) {
        this.editor
          .setBlocks(DEFAULT_NODE)
          .unwrapBlock(NODE_BULLETED_LIST)
          .unwrapBlock(NODE_NUMBERED_LIST)
      } else if (isList) {
        const oldListType =
          type === NODE_BULLETED_LIST ? NODE_NUMBERED_LIST : NODE_BULLETED_LIST

        this.editor.unwrapBlock(oldListType).wrapBlock(type)
      } else {
        this.editor.setBlocks(NODE_LIST_ITEM).wrapBlock(type)
      }
    }
  }

  handleToggleCode(valueIsCodeBlock, valueIsCodeMark) {
    if (valueIsCodeBlock) {
      return this.editor.setBlocks(DEFAULT_NODE)
    }

    if (valueIsCodeMark) {
      return this.editor.toggleMark(NODE_CODE)
    }

    const {blocks, selection} = this.value

    // If the selection spans across more than one node, we render a code
    // block.
    let isBlock = blocks.size > 1

    // We do an additional check to see if the selection corresponds to the
    // entirety of a node. If it does, we also render a block.
    if (!isBlock) {
      const {end, start} = selection
      const block = blocks.get(0)

      isBlock = start.isAtStartOfNode(block) && end.isAtEndOfNode(block)
    }

    if (isBlock) {
      this.editor.wrapBlock(NODE_CODE)
    } else {
      this.editor.toggleMark(NODE_CODE)
    }
  }

  handleToggleFullscreen(value) {
    const {isFullscreen} = this.state

    if (isFullscreen !== value) {
      this.setState({
        isFullscreen: typeof value === 'boolean' ? value : !isFullscreen
      })
    }
  }

  handleToggleLink(valueIsLink) {
    if (valueIsLink) {
      return this.editor.unwrapInline(NODE_LINK)
    }

    if (this.value.selection.isExpanded) {
      if (this.isNarrowViewport) {
        const href = this.openLinkPrompt()

        if (href !== '') {
          this.editor.wrapInline({
            type: NODE_LINK,
            data: {
              href
            }
          })
        }

        return
      }

      this.editor.wrapInline({
        type: NODE_LINK,
        data: {
          href: ''
        }
      })
    }
  }

  handleToggleMark(type) {
    if (this.state.isRawMode) {
      return
    }

    this.editor.toggleMark(type)
  }

  handleToggleMediaSelect(isSelectingMedia) {
    this.setState({
      isSelectingMedia
    })
  }

  handleToggleRawMode() {
    const {onChange} = this.props
    const {isRawMode} = this.state
    const serialisedValue = this.serialise(this.value)

    onChange.call(this, serialisedValue)

    this.setState({
      isRawMode: !isRawMode
    })
  }

  hasBlock(type) {
    return this.value.blocks.some(block => block.type === type)
  }

  hasInline(type) {
    return this.value.inlines.some(inline => inline.type === type)
  }

  hasMark(type) {
    return this.value.activeMarks.some(mark => mark.type === type)
  }

  isListOfType(type) {
    const {blocks, document} = this.value

    let valueIsInList = this.hasBlock(type)

    if (blocks.size > 0) {
      const parent = document.getParent(blocks.first().key)

      valueIsInList =
        this.hasBlock(NODE_LIST_ITEM) && parent && parent.type === type
    }

    return valueIsInList
  }

  openLinkPrompt(currentHref) {
    return window.prompt(
      'Enter the link URL or clear the field to remove the link',
      currentHref || ''
    )
  }

  render() {
    const {isFullscreen} = this.state

    if (isFullscreen) {
      return <Fullscreen>{this.renderEditor()}</Fullscreen>
    }

    return this.renderEditor()
  }

  renderBlock(props, _, next) {
    const {attributes, children, isFocused, node} = props

    switch (node.type) {
      case NODE_CODE:
        return (
          <code {...attributes} className={styles['code-block']}>
            {children}
          </code>
        )

      case NODE_BLOCKQUOTE:
        return <blockquote {...attributes}>{children}</blockquote>

      case NODE_BULLETED_LIST:
        return <ul {...attributes}>{children}</ul>

      case NODE_HEADING1:
        return (
          <h1 {...attributes} className={styles.heading}>
            {children}
          </h1>
        )

      case NODE_HEADING2:
        return (
          <h2 {...attributes} className={styles.heading}>
            {children}
          </h2>
        )

      case NODE_IMAGE: {
        const imageStyle = new Style(styles, 'image').addIf(
          'image-focused',
          isFocused
        )

        return (
          <img
            {...attributes}
            className={imageStyle.getClasses()}
            src={node.data.get('src')}
          />
        )
      }

      case NODE_LIST_ITEM:
        return <li {...attributes}>{children}</li>

      case NODE_NUMBERED_LIST:
        return <ol {...attributes}>{children}</ol>

      default:
        return next()
    }
  }

  renderEditor() {
    const {isFullscreen, isRawMode, isSelectingMedia} = this.state
    const containerStyle = new Style(styles).addIf(
      'container-fullscreen',
      isFullscreen
    )
    const editorWrapperStyle = new Style(styles, 'editor-wrapper').addIf(
      'editor-wrapper-raw',
      isRawMode
    )
    const editorStyle = new Style(styles, 'editor').addIf(
      'editor-focused',
      this.state.isFocused
    )

    // This will be used by certain elements (e.g. links) to adjust their
    // behaviour based on the viewport size.
    this.isNarrowViewport = window.innerWidth < 1000

    // Deserialising the value and caching the result, so that other methods
    // can use it.
    this.value = this.deserialise(this.props.value)

    const valueIsCodeBlock = this.hasBlock(NODE_CODE)
    const valueIsCodeMark = this.hasMark(NODE_CODE)
    const valueIsLink = this.hasInline(NODE_LINK)

    return (
      <div className={containerStyle.getClasses()}>
        {isSelectingMedia && (
          <Modal
            onRequestClose={this.handleToggleMediaSelect.bind(this, false)}
            scrollContent={false}
          >
            {this.renderMediaSelect()}
          </Modal>
        )}

        <RichEditorToolbar isFullscreen={isFullscreen}>
          <div>
            <RichEditorToolbarButton
              action={this.handleToggleMark.bind(this, NODE_BOLD)}
              active={this.hasMark(NODE_BOLD)}
              disabled={isRawMode}
              icon={IconBold}
              text="Bold"
            />
            <RichEditorToolbarButton
              action={this.handleToggleMark.bind(this, NODE_ITALIC)}
              active={this.hasMark(NODE_ITALIC)}
              disabled={isRawMode}
              icon={IconItalic}
              text="Italic"
            />
            <RichEditorToolbarButton
              action={this.handleToggleLink.bind(this, valueIsLink)}
              active={valueIsLink}
              disabled={isRawMode}
              icon={IconLink}
              text="Link"
            />
            <RichEditorToolbarButton
              action={this.handleToggleBlock.bind(this, NODE_HEADING1)}
              active={this.hasBlock(NODE_HEADING1)}
              disabled={isRawMode}
              icon={IconH1}
              text="Heading 1"
            />
            <RichEditorToolbarButton
              action={this.handleToggleBlock.bind(this, NODE_HEADING2)}
              active={this.hasBlock(NODE_HEADING2)}
              disabled={isRawMode}
              icon={IconH2}
              text="Heading 2"
            />
            <RichEditorToolbarButton
              action={this.handleToggleBlock.bind(this, NODE_BLOCKQUOTE)}
              active={this.hasBlock(NODE_BLOCKQUOTE)}
              disabled={isRawMode}
              icon={IconQuote}
              text="Quote"
            />
            <RichEditorToolbarButton
              action={this.handleToggleBlock.bind(this, NODE_NUMBERED_LIST)}
              active={this.isListOfType(NODE_NUMBERED_LIST)}
              disabled={isRawMode}
              icon={IconNumberedList}
              text="Numbered list"
            />
            <RichEditorToolbarButton
              action={this.handleToggleBlock.bind(this, NODE_BULLETED_LIST)}
              active={this.isListOfType(NODE_BULLETED_LIST)}
              disabled={isRawMode}
              icon={IconBulletedList}
              text="Bulleted list"
            />
            <RichEditorToolbarButton
              action={this.handleToggleCode.bind(
                this,
                valueIsCodeBlock,
                valueIsCodeMark
              )}
              active={valueIsCodeBlock || valueIsCodeMark}
              disabled={isRawMode}
              icon={IconCode}
              text="Code block"
            />
            <RichEditorToolbarButton
              action={this.handleToggleMediaSelect.bind(this, true)}
              icon={IconMedia}
              text="Media"
            />
          </div>

          <div>
            <RichEditorToolbarButton
              action={this.handleToggleRawMode.bind(this)}
              active={isRawMode}
              icon={IconText}
              text="Raw mode"
            />
            <RichEditorToolbarButton
              action={this.handleToggleFullscreen.bind(this)}
              active={isFullscreen}
              icon={IconFullscreen}
              text="Full-screen"
            />
          </div>
        </RichEditorToolbar>

        <div
          className={editorWrapperStyle.getClasses()}
          ref={el => (this.container = el)}
        >
          <Editor
            className={editorStyle.getClasses()}
            onChange={this.handleChange.bind(this)}
            renderBlock={this.renderBlock.bind(this)}
            renderInline={this.renderInline.bind(this)}
            renderMark={this.renderMark.bind(this)}
            ref={el => (this.editor = el)}
            schema={SCHEMA}
            value={this.value}
          />
        </div>
      </div>
    )
  }

  renderInline({children, node}, _, next) {
    switch (node.type) {
      case NODE_LINK: {
        const href = node.data.get('href')

        if (this.isNarrowViewport) {
          return (
            <a
              href={href}
              onClick={this.handleLinkClick.bind(this, node, href)}
            >
              {children}
            </a>
          )
        }

        return (
          <RichEditorLink
            bounds={this.containerBounds}
            href={href}
            onChange={this.handleLinkUpdate.bind(this, node)}
          >
            {children}
          </RichEditorLink>
        )
      }

      default:
        return next()
    }
  }

  renderMark({children, mark, attributes}, _, next) {
    switch (mark.type) {
      case NODE_BOLD:
        return <strong {...attributes}>{children}</strong>

      case NODE_CODE:
        return <code {...attributes}>{children}</code>

      case NODE_ITALIC:
        return <em {...attributes}>{children}</em>

      default:
        return next()
    }
  }

  renderMediaSelect() {
    const {contentKey} = this.props
    const {mediaFilters, mediaPage, mediaSelection} = this.state
    const compoundContentKey =
      contentKey +
      JSON.stringify({
        filters: mediaFilters,
        page: mediaPage
      })
    const collection = Constants.MEDIA_COLLECTION_SCHEMA

    return (
      <DocumentList
        collection={collection}
        contentKey={compoundContentKey}
        filters={mediaFilters}
        onEmptyList={() => (
          <HeroMessage
            title="No media yet."
            subtitle="There are no items in the media library."
          >
            <Button accent="save" href="/media">
              Upload some
            </Button>
          </HeroMessage>
        )}
        onRender={({documents, metadata, onSelect, selectedDocuments}) => (
          <>
            <div className={styles['media-select-filters']}>
              <DocumentFilters
                collection={collection}
                filters={mediaFilters}
                onUpdateFilters={newFilters =>
                  this.setState({
                    mediaFilters: newFilters
                  })
                }
              />
            </div>

            <div className={styles['media-select-documents']}>
              <DocumentGridList
                documents={documents}
                onRenderCard={({item, isSelected, onSelect}) => (
                  <MediaGridCard
                    key={item._id}
                    isSelected={isSelected}
                    item={item}
                    onSelect={onSelect}
                  />
                )}
                onSelect={onSelect}
                selectedDocuments={selectedDocuments}
              />
            </div>

            <div className={styles['media-select-toolbar']}>
              <DocumentListToolbar
                metadata={metadata}
                pageChangeHandler={() => page =>
                  this.setState({
                    mediaPage: page
                  })}
              >
                <Button
                  accent="save"
                  disabled={mediaSelection.length === 0}
                  onClick={this.handleMediaInsert.bind(this)}
                >
                  Insert items
                </Button>
              </DocumentListToolbar>
            </div>
          </>
        )}
        onSelect={newSelection =>
          this.setState({
            mediaSelection: newSelection
          })
        }
        page={mediaPage}
        selection={mediaSelection}
      />
    )
  }

  serialise(value) {
    const {format} = this.props
    const {isRawMode} = this.state

    if (Value.isValue(value)) {
      if (!isRawMode && format === FORMAT_MARKDOWN) {
        return this.markdown.serialize(value)
      }

      return PlainSerializer.serialize(value)
    }

    return value
  }

  validate({validateFn, value}) {
    if (Value.isValue(value)) {
      return Promise.resolve()
    }

    return validateFn(value)
  }
}
