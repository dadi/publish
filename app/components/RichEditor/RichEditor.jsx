import * as Nodes from './slateNodes'
import {
  Code,
  FormatBold,
  FormatIndentDecrease,
  FormatIndentIncrease,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  Fullscreen,
  FullscreenExit,
  ImageSearch,
  InsertLink
} from '@material-ui/icons'
import {isTouchDevice, openLinkPrompt} from './utils'
import {renderBlock, renderMark} from './slateRender'
import {RichEditorToolbar, RichEditorToolbarButton} from './RichEditorToolbar'
import {Editor} from 'slate-react'
import FullscreenComp from 'components/Fullscreen/Fullscreen'
import HotKeys from 'lib/hot-keys'
import {Markdown} from 'mdi-material-ui'
import MarkdownSerializer from '@edithq/slate-md-serializer'
import PlainSerializer from 'slate-plain-serializer'
import plugin from './slatePlugin'
import proptypes from 'prop-types'
import React from 'react'
import ReferenceSelectView from 'views/ReferenceSelectView/ReferenceSelectView'
import RichEditorLink from './RichEditorLink'
import SCHEMA_RICH from './slateSchemaRich'
import Style from 'lib/Style'
import styles from './RichEditor.css'
import {Value} from 'slate'

const EMPTY_VALUE = {
  document: {
    nodes: [
      {
        object: 'block',
        type: 'line',
        nodes: [{object: 'text', text: ''}]
      }
    ]
  }
}

const FORMAT_MARKDOWN = 'markdown'

const SCHEMA_RAW = {
  document: {
    nodes: [{match: [{type: 'line'}]}]
  },
  blocks: {
    line: {
      nodes: [{match: {object: 'text'}}]
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

    this.closeFullscreen = () => this.setState({isFullscreen: false})
    this.handleChange = this.handleChange.bind(this)
    this.handleMediaInsert = this.handleMediaInsert.bind(this)
    this.renderEditor = this.renderEditor.bind(this)
    this.renderInline = this.renderInline.bind(this)
    this.startSelectingMedia = () => this.setState({isSelectingMedia: true})
    this.stopSelectingMedia = () => this.setState({isSelectingMedia: false})
    this.toggleFullscreen = () =>
      this.setState(({isFullscreen}) => ({isFullscreen: !isFullscreen}))
    this.toggleRawMode = this.toggleRawMode.bind(this)

    this.hotKeys = new HotKeys({escape: this.closeFullscreen})

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
      onSaveRegister(({value}) => this.serialise(value))
    }

    if (typeof onValidateRegister === 'function') {
      onValidateRegister(({validateFn, value}) =>
        Value.isValue(value) ? Promise.resolve() : validateFn(value)
      )
    }
  }

  componentDidUpdate() {
    if (this.container) {
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

    if (this.state.isFocused !== isFocused) {
      this.setState({isFocused})
    }

    onChange(value)
  }

  handleLinkClick(node, currentHref, event) {
    event.preventDefault()

    const newHref = openLinkPrompt(currentHref)

    this.handleLinkUpdate(node, newHref)
  }

  handleLinkUpdate(node, href) {
    href === ''
      ? this.editor.unwrapInlineByKey(node.key, Nodes.INLINE_LINK)
      : this.editor.setNodeByKey(node.key, {data: {href}})

    this.editor.focus()
  }

  handleMediaInsert(mediaSelection) {
    this.setState({...this.initialMediaState}, () => {
      mediaSelection.forEach(({altText, url}) => {
        if (!url) return

        const block = this.state.isRawMode
          ? {
              type: 'line',
              nodes: [{object: 'text', text: `![${altText || ''}](${url})`}]
            }
          : {
              type: 'image',
              data: {alt: altText, src: url}
            }

        this.editor.insertBlock(block)
      })
    })
  }

  render() {
    const {isFullscreen, isSelectingMedia, isRawMode} = this.state

    if (isSelectingMedia) {
      const collection = {
        fields: {
          mediaSelect: {
            type: 'Media'
          }
        }
      }

      return (
        <FullscreenComp>
          <ReferenceSelectView
            buildUrl={() => '/media'}
            collection={collection}
            onCancel={this.stopSelectingMedia}
            onSave={this.handleMediaInsert}
            referenceFieldName="mediaSelect"
            saveText="Insert items"
          />
        </FullscreenComp>
      )
    }

    // Deserialising the value and caching the result, so that other methods
    // can use it.
    this.value = this.deserialise(this.props.value)

    const editor = isRawMode ? (
      <Editor
        className={styles.editor}
        onChange={this.handleChange}
        ref={el => (this.editor = el)}
        renderEditor={this.renderEditor}
        schema={SCHEMA_RAW}
        value={this.value}
      />
    ) : (
      <Editor
        className={styles.editor}
        onChange={this.handleChange}
        plugins={plugin}
        ref={el => (this.editor = el)}
        renderBlock={renderBlock}
        renderEditor={this.renderEditor}
        renderInline={this.renderInline}
        renderMark={renderMark}
        schema={SCHEMA_RICH}
        value={this.value}
      />
    )

    if (isFullscreen) {
      return (
        <FullscreenComp>
          <div className={styles['fullscreen-wrapper']}>{editor}</div>
        </FullscreenComp>
      )
    }

    return editor
  }

  renderEditor(_, editor, next) {
    const {isFocused, isFullscreen, isRawMode} = this.state
    const containerStyle = new Style(styles, 'container')
      .addIf('fullscreen', isFullscreen)
      .addIf('raw-mode', isRawMode)
      .addIf('focused', isFocused)

    return (
      <div className={containerStyle.getClasses()}>
        <div className={styles.divider} />
        <RichEditorToolbar isFullscreen={isFullscreen}>
          <div>
            <RichEditorToolbarButton
              action={editor.toggleBold}
              active={!isRawMode && editor.hasMark(Nodes.MARK_BOLD)}
              disabled={isRawMode || editor.isInBlocks(Nodes.BLOCK_CODE)}
              title="Bold" // (Ctrl+B)"
            >
              <FormatBold />
            </RichEditorToolbarButton>
            <RichEditorToolbarButton
              action={editor.toggleItalic}
              active={!isRawMode && editor.hasMark(Nodes.MARK_ITALIC)}
              disabled={isRawMode || editor.isInBlocks(Nodes.BLOCK_CODE)}
              title="Italic" // (Ctrl+I)"
            >
              <FormatItalic />
            </RichEditorToolbarButton>
            <RichEditorToolbarButton
              action={editor.toggleHeading1}
              active={!isRawMode && editor.isInBlocks(Nodes.BLOCK_HEADING1)}
              disabled={isRawMode}
              title="Heading 1" // (Ctrl+Alt+1)"
            >
              <span className={styles['toolbar-heading-icon']}>H1</span>
            </RichEditorToolbarButton>
            <RichEditorToolbarButton
              action={editor.toggleHeading2}
              active={!isRawMode && editor.isInBlocks(Nodes.BLOCK_HEADING2)}
              disabled={isRawMode}
              title="Heading 2" // (Ctrl+Alt+2)"
            >
              <span className={styles['toolbar-heading-icon']}>H2</span>
            </RichEditorToolbarButton>
            <RichEditorToolbarButton
              action={editor.toggleHeading3}
              active={!isRawMode && editor.isInBlocks(Nodes.BLOCK_HEADING3)}
              disabled={isRawMode}
              title="Heading 3" // (Ctrl+Alt+3)"
            >
              <span className={styles['toolbar-heading-icon']}>H3</span>
            </RichEditorToolbarButton>
            <RichEditorToolbarButton
              action={editor.toggleNumberedList}
              active={!isRawMode && editor.isInList(Nodes.BLOCK_NUMBERED_LIST)}
              disabled={isRawMode}
              title="Numbered list" // (Ctrl+Shift+7)"
            >
              <FormatListNumbered />
            </RichEditorToolbarButton>
            <RichEditorToolbarButton
              action={editor.toggleBulletedList}
              active={!isRawMode && editor.isInList(Nodes.BLOCK_BULLETED_LIST)}
              disabled={isRawMode}
              title="Bulleted list" // (Ctrl+Shift+8)"
            >
              <FormatListBulleted />
            </RichEditorToolbarButton>
            <RichEditorToolbarButton
              action={editor.deindent}
              disabled={isRawMode}
              title="Decrease indent" // (Ctrl+[)"
            >
              <FormatIndentDecrease />
            </RichEditorToolbarButton>
            <RichEditorToolbarButton
              action={editor.indent}
              disabled={isRawMode}
              title="Increase indent" // (Ctrl+])"
            >
              <FormatIndentIncrease />
            </RichEditorToolbarButton>
            <RichEditorToolbarButton
              action={editor.toggleBlockquote}
              active={!isRawMode && editor.isInBlockQuote()}
              disabled={isRawMode}
              title="Blockquote" // (Ctrl+Q)"
            >
              <FormatQuote />
            </RichEditorToolbarButton>
            <RichEditorToolbarButton
              action={editor.toggleCode}
              active={
                !isRawMode &&
                (editor.isInBlocks(Nodes.BLOCK_CODE) ||
                  editor.hasMark(Nodes.MARK_CODE))
              }
              disabled={isRawMode}
              title="Code" // (Ctrl+`)"
            >
              <Code />
            </RichEditorToolbarButton>
            <RichEditorToolbarButton
              action={editor.toggleLink}
              active={!isRawMode && editor.hasLink()}
              disabled={isRawMode || editor.isInBlocks(Nodes.BLOCK_CODE)}
              title="Insert link" // (Ctrl+K)"
            >
              <InsertLink />
            </RichEditorToolbarButton>
            <RichEditorToolbarButton
              action={this.startSelectingMedia}
              disabled={editor.isInBlocks(Nodes.BLOCK_CODE)}
              title="Insert asset from library"
            >
              <ImageSearch />
            </RichEditorToolbarButton>
          </div>

          <div>
            <RichEditorToolbarButton
              action={this.toggleRawMode}
              active={isRawMode}
              title="Markdown mode"
            >
              <Markdown />
            </RichEditorToolbarButton>
            <RichEditorToolbarButton
              action={this.toggleFullscreen}
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
            </RichEditorToolbarButton>
          </div>
        </RichEditorToolbar>

        <div ref={el => (this.container = el)}>{next()}</div>
      </div>
    )
  }

  renderInline({children, node}, _, next) {
    switch (node.type) {
      case Nodes.INLINE_LINK: {
        const href = node.data.get('href')

        if (isTouchDevice) {
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

  toggleRawMode() {
    this.props.onChange(this.serialise(this.value))
    this.setState(({isRawMode}) => ({isRawMode: !isRawMode}))
  }
}
