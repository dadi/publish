import {
  Code,
  FormatBold,
  // FormatIndentDecrease,
  // FormatIndentIncrease,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  Fullscreen,
  FullscreenExit,
  ImageSearch,
  InsertLink
} from '@material-ui/icons'
import {Document, Value} from 'slate'
import {RichEditorToolbar, RichEditorToolbarButton} from './RichEditorToolbar'
import {Editor} from 'slate-react'
import FullscreenComp from 'components/Fullscreen/Fullscreen'
import HotKeys from 'lib/hot-keys'
import isHotkey from 'is-hotkey'
import {Markdown} from 'mdi-material-ui'
import MarkdownSerializer from '@edithq/slate-md-serializer'
import PlainSerializer from 'slate-plain-serializer'
import proptypes from 'prop-types'
import React from 'react'
import ReferenceSelectView from 'views/ReferenceSelectView/ReferenceSelectView'
import RichEditorLink from './RichEditorLink'
import Style from 'lib/Style'
import styles from './RichEditor.css'

const DEFAULT_NODE = 'paragraph'
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

const BLOCK_BLOCKQUOTE = 'block-quote'
const BLOCK_BULLETED_LIST = 'bulleted-list'
const BLOCK_CODE = 'code'
const BLOCK_HEADING1 = 'heading1'
const BLOCK_HEADING2 = 'heading2'
const BLOCK_HEADING3 = 'heading3'
const BLOCK_HEADING4 = 'heading4'
const BLOCK_HEADING5 = 'heading5'
const BLOCK_HEADING6 = 'heading6'
const BLOCK_HR = 'horizontal-rule'
const BLOCK_IMAGE = 'image'
const BLOCK_LIST_ITEM = 'list-item'
const BLOCK_NUMBERED_LIST = 'ordered-list'

const HEADINGS = [
  BLOCK_HEADING1,
  BLOCK_HEADING2,
  BLOCK_HEADING3,
  BLOCK_HEADING4,
  BLOCK_HEADING5,
  BLOCK_HEADING6
]

const INLINE_LINK = 'link'

const MARK_BOLD = 'bold'
const MARK_CODE = 'code'
const MARK_ITALIC = 'italic'

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
const SCHEMA_RICH = {
  blocks: {
    image: {isVoid: true},
    'horizontal-rule': {isVoid: true}
  }
}

const isModB = isHotkey('mod+b')
const isModI = isHotkey('mod+i')
const isModBacktick = isHotkey('mod+`')
const isModQ = isHotkey('mod+q')
const isModK = isHotkey('mod+k')
const isModAlt1 = isHotkey('mod+alt+1')
const isModAlt2 = isHotkey('mod+alt+2')
const isModAlt3 = isHotkey('mod+alt+3')
const isModAltN = isHotkey('mod+alt+n')
const isModAltB = isHotkey('mod+alt+b')
const isEnter = isHotkey('enter')
const isBackspace = isHotkey('backspace')

// http://www.stucox.com/blog/you-cant-detect-a-touchscreen/
const isTouchDevice = window.matchMedia('(pointer: coarse)').matches

const plugin = {
  commands: {
    toggleBlocks(editor, type) {
      editor
        .setBlocks(editor.isInBlocks(type) ? DEFAULT_NODE : type)
        .unwrapBlock(BLOCK_BULLETED_LIST)
        .unwrapBlock(BLOCK_NUMBERED_LIST)
    },
    toggleBold(editor) {
      editor.toggleMark(MARK_BOLD)
    },
    toggleItalic(editor) {
      editor.toggleMark(MARK_ITALIC)
    },
    toggleCode(editor) {
      const {blocks, selection} = editor.value

      if (!blocks.size) return

      const isInCodeBlocks = editor.isInBlocks(BLOCK_CODE)
      const isOnlyOneBlock = blocks.first() === blocks.last()
      const isNotWholeBlock = !(
        selection.start.isAtStartOfNode(blocks.first()) &&
        selection.end.isAtEndOfNode(blocks.last())
      )

      if (
        !blocks.size ||
        (!isInCodeBlocks && isOnlyOneBlock && isNotWholeBlock)
      ) {
        return editor.toggleMark(MARK_CODE)
      }

      editor.moveToRangeOfNode(blocks.first(), blocks.last())

      // Code blocks have a single text leaf node containing the whole content
      // of the block; lines are separated by `\n`.
      if (isInCodeBlocks) {
        const lines = blocks
          .flatMap(codeBlock => codeBlock.text.split('\n'))
          .map(line => ({
            object: 'block',
            type: DEFAULT_NODE,
            nodes: [{object: 'text', text: line}]
          }))

        return editor
          .delete()
          .setBlocks(DEFAULT_NODE)
          .insertFragment(Document.create({nodes: lines}))
      }

      const text = PlainSerializer.serialize({
        document: editor.value.fragment
      })

      editor
        .delete()
        .setBlocks(BLOCK_CODE)
        .insertText(text)
    },
    toggleHeading1(editor) {
      editor.toggleBlocks(BLOCK_HEADING1)
    },
    toggleHeading2(editor) {
      editor.toggleBlocks(BLOCK_HEADING2)
    },
    toggleHeading3(editor) {
      editor.toggleBlocks(BLOCK_HEADING3)
    },
    toggleBlockquote(editor) {
      if (editor.isInBlockQuote()) {
        return editor.unwrapBlock(BLOCK_BLOCKQUOTE)
      }

      editor.wrapBlock(BLOCK_BLOCKQUOTE)
    },
    toggleNumberedList(editor) {
      if (editor.isInList(BLOCK_NUMBERED_LIST)) {
        return editor.setBlocks(DEFAULT_NODE).unwrapBlock(BLOCK_NUMBERED_LIST)
      }

      editor
        .setBlocks(BLOCK_LIST_ITEM)
        .unwrapBlock(BLOCK_BULLETED_LIST)
        .wrapBlock(BLOCK_NUMBERED_LIST)
    },
    toggleBulletedList(editor) {
      if (editor.isInList(BLOCK_BULLETED_LIST)) {
        return editor.setBlocks(DEFAULT_NODE).unwrapBlock(BLOCK_BULLETED_LIST)
      }

      editor
        .setBlocks(BLOCK_LIST_ITEM)
        .unwrapBlock(BLOCK_NUMBERED_LIST)
        .wrapBlock(BLOCK_BULLETED_LIST)
    },
    toggleLink(editor) {
      if (editor.hasLink()) {
        return editor.unwrapInline(INLINE_LINK)
      }

      if (!editor.value.selection.isExpanded) return

      if (!isTouchDevice) {
        return editor.wrapInline({type: INLINE_LINK, data: {href: ''}})
      }

      const href = openLinkPrompt()

      if (href !== '') {
        editor.wrapInline({type: INLINE_LINK, data: {href}})
      }
    },
    splitHeading(editor) {
      const {blocks, selection} = editor.value

      if (selection.start.isAtStartOfNode(blocks.first())) {
        const isWholeBlock = selection.end.isAtEndOfNode(blocks.last())

        // Insert blank paragraph *before* the heading. If we hadn't selected
        // the whole heading, the cursor is in the inserted blank paragraph;
        // move it to the heading block.
        return isWholeBlock
          ? editor.insertBlock(DEFAULT_NODE)
          : editor.insertBlock(DEFAULT_NODE).moveToStartOfNextBlock()
      }

      editor.splitBlock().setBlocks(DEFAULT_NODE)
    }
  },
  queries: {
    isInBlocks(editor, type) {
      return editor.value.blocks.every(block => block.type === type)
    },
    isInBlockQuote(editor) {
      const {blocks, document} = editor.value

      return blocks.every(block => {
        const furthestBlock = document.getFurthestBlock(block.key)

        return (
          block.type === BLOCK_BLOCKQUOTE ||
          (furthestBlock && furthestBlock.type === BLOCK_BLOCKQUOTE)
        )
      })
    },
    isInList(editor, type) {
      const {blocks, document} = editor.value

      return blocks.every(
        block =>
          block.type === BLOCK_LIST_ITEM &&
          document.getParent(block.key).type === type
      )
    },
    hasMark(editor, type) {
      return editor.value.activeMarks.some(block => block.type === type)
    },
    hasLink(editor) {
      const {inlines} = editor.value

      return inlines.size === 1 && inlines.first().type === INLINE_LINK
    },
    isInHeading(editor) {
      return editor.value.blocks.every(block => HEADINGS.includes(block.type))
    }
  },
  onKeyDown(e, editor, next) {
    if (isModB(e)) {
      return editor.toggleBold()
    }

    if (isModI(e)) {
      return editor.toggleItalic()
    }

    if (isModBacktick(e)) {
      e.preventDefault()

      return editor.toggleCode()
    }

    if (isModQ(e)) {
      return editor.toggleBlockquote()
    }

    if (isModK(e)) {
      e.preventDefault()

      return editor.toggleLink()
    }

    if (isModAlt1(e)) {
      return editor.toggleHeading1()
    }

    if (isModAlt2(e)) {
      return editor.toggleHeading2()
    }

    if (isModAlt3(e)) {
      return editor.toggleHeading3()
    }

    if (isModAltN(e)) {
      return editor.toggleNumberedList()
    }

    if (isModAltB(e)) {
      return editor.toggleBulletedList()
    }

    const {blocks, selection} = editor.value
    const isSelectionAtStart =
      blocks.size &&
      selection.start.isAtStartOfNode(blocks.first()) &&
      selection.end.isAtStartOfNode(blocks.first())

    if (isEnter(e)) {
      if (editor.isInHeading()) {
        return editor.splitHeading()
      }

      if (editor.isInBlocks(BLOCK_CODE)) {
        return editor.insertText('\n')
      }

      if (editor.isInBlocks(BLOCK_LIST_ITEM)) {
        if (blocks.size === 1 && blocks.first().text === '') {
          return editor
            .setBlocks(DEFAULT_NODE)
            .unwrapBlock(BLOCK_NUMBERED_LIST)
            .unwrapBlock(BLOCK_BULLETED_LIST)
        }

        if (isSelectionAtStart) {
          return editor
            .insertBlock(DEFAULT_NODE)
            .unwrapBlock(BLOCK_NUMBERED_LIST)
            .unwrapBlock(BLOCK_BULLETED_LIST)
            .moveToStartOfNextBlock()
        }
      }
    }

    if (
      isBackspace(e) &&
      editor.isInBlocks(BLOCK_LIST_ITEM) &&
      isSelectionAtStart
    ) {
      return editor
        .setBlocks(DEFAULT_NODE)
        .unwrapBlock(BLOCK_NUMBERED_LIST)
        .unwrapBlock(BLOCK_BULLETED_LIST)
    }

    next()
  }
}

const plugins = [plugin]

function renderBlock(props, _, next) {
  const {attributes, children, isFocused, node} = props

  switch (node.type) {
    case BLOCK_CODE: {
      const language = node.data.get('language')

      return (
        <pre {...attributes}>
          <code className={language && `language-${language}`}>{children}</code>
        </pre>
      )
    }

    case BLOCK_BLOCKQUOTE:
      return <blockquote {...attributes}>{children}</blockquote>

    case BLOCK_BULLETED_LIST:
      return <ul {...attributes}>{children}</ul>

    case BLOCK_HEADING1:
      return (
        <h1 {...attributes} className={styles.heading}>
          {children}
        </h1>
      )

    case BLOCK_HEADING2:
      return (
        <h2 {...attributes} className={styles.heading}>
          {children}
        </h2>
      )

    case BLOCK_HEADING3:
      return (
        <h3 {...attributes} className={styles.heading}>
          {children}
        </h3>
      )

    case BLOCK_HEADING4:
      return (
        <h4 {...attributes} className={styles.heading}>
          {children}
        </h4>
      )

    case BLOCK_HEADING5:
      return (
        <h5 {...attributes} className={styles.heading}>
          {children}
        </h5>
      )

    case BLOCK_HEADING6:
      return (
        <h6 {...attributes} className={styles.heading}>
          {children}
        </h6>
      )

    case BLOCK_HR:
      return <hr />

    case BLOCK_IMAGE: {
      const imageWrapperStyle = new Style(styles, 'image-wrapper').addIf(
        'focused',
        isFocused
      )

      return (
        <div className={imageWrapperStyle.getClasses()}>
          <img
            {...attributes}
            alt={node.data.get('alt')}
            src={node.data.get('src')}
          />
        </div>
      )
    }

    case BLOCK_LIST_ITEM:
      return <li {...attributes}>{children}</li>

    case BLOCK_NUMBERED_LIST:
      return <ol {...attributes}>{children}</ol>

    default:
      return next()
  }
}

function renderMark({children, mark, attributes}, _, next) {
  switch (mark.type) {
    case MARK_BOLD:
      return <strong {...attributes}>{children}</strong>

    case MARK_CODE:
      return <code {...attributes}>{children}</code>

    case MARK_ITALIC:
      return <em {...attributes}>{children}</em>

    default:
      return next()
  }
}

function openLinkPrompt(currentHref) {
  return window.prompt(
    'Enter the link URL or clear the field to remove the link',
    currentHref || ''
  )
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

    if (this.state.isFocused !== isFocused) {
      this.setState({isFocused})
    }

    onChange(value)
  }

  handleLinkClick(node, currentHref, event) {
    event.preventDefault()

    const newHref = openLinkPrompt(currentHref)

    return this.handleLinkUpdate(node, newHref)
  }

  handleLinkUpdate(node, href) {
    if (href === '') {
      return this.editor.unwrapInlineByKey(node.key, INLINE_LINK)
    }

    this.editor.setNodeByKey(node.key, {data: {href}})
  }

  handleMediaInsert(mediaSelection) {
    const {isRawMode} = this.state

    this.setState({...this.initialMediaState}, () => {
      mediaSelection.forEach(mediaObject => {
        if (!mediaObject.url) return

        if (isRawMode) {
          return this.editor.insertBlock({
            type: 'line',
            nodes: [
              {
                object: 'text',
                text: `![${mediaObject.altText || ''}](${mediaObject.url})`
              }
            ]
          })
        }

        this.editor.insertBlock({
          type: 'image',
          data: {
            alt: mediaObject.altText,
            src: mediaObject.url
          }
        })
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
        plugins={plugins}
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
              active={editor.hasMark(MARK_BOLD)}
              disabled={isRawMode}
              title="Bold" // (Ctrl+B)"
            >
              <FormatBold />
            </RichEditorToolbarButton>
            <RichEditorToolbarButton
              action={editor.toggleItalic}
              active={editor.hasMark(MARK_ITALIC)}
              disabled={isRawMode}
              title="Italic" // (Ctrl+I)"
            >
              <FormatItalic />
            </RichEditorToolbarButton>
            <RichEditorToolbarButton
              action={editor.toggleHeading1}
              active={editor.isInBlocks(BLOCK_HEADING1)}
              disabled={isRawMode}
              title="Heading 1" // (Ctrl+Alt+1)"
            >
              <span className={styles['toolbar-heading-icon']}>H1</span>
            </RichEditorToolbarButton>
            <RichEditorToolbarButton
              action={editor.toggleHeading2}
              active={editor.isInBlocks(BLOCK_HEADING2)}
              disabled={isRawMode}
              title="Heading 2" // (Ctrl+Alt+2)"
            >
              <span className={styles['toolbar-heading-icon']}>H2</span>
            </RichEditorToolbarButton>
            <RichEditorToolbarButton
              action={editor.toggleHeading3}
              active={editor.isInBlocks(BLOCK_HEADING3)}
              disabled={isRawMode}
              title="Heading 3" // (Ctrl+Alt+3)"
            >
              <span className={styles['toolbar-heading-icon']}>H3</span>
            </RichEditorToolbarButton>
            <RichEditorToolbarButton
              action={editor.toggleNumberedList}
              active={editor.isInList(BLOCK_NUMBERED_LIST)}
              disabled={isRawMode}
              title="Numbered list" // (Ctrl+Shift+7)"
            >
              <FormatListNumbered />
            </RichEditorToolbarButton>
            <RichEditorToolbarButton
              action={editor.toggleBulletedList}
              active={editor.isInList(BLOCK_BULLETED_LIST)}
              disabled={isRawMode}
              title="Bulleted list" // (Ctrl+Shift+8)"
            >
              <FormatListBulleted />
            </RichEditorToolbarButton>
            {/* <RichEditorToolbarButton
              action={() => {}}
              disabled={isRawMode}
              title="Decrease indent (Ctrl+[)"
            >
              <FormatIndentDecrease />
            </RichEditorToolbarButton>
            <RichEditorToolbarButton
              action={() => {}}
              disabled={isRawMode}
              title="Increase indent (Ctrl+])"
            >
              <FormatIndentIncrease />
            </RichEditorToolbarButton> */}
            <RichEditorToolbarButton
              action={editor.toggleBlockquote}
              active={editor.isInBlockQuote()}
              disabled={isRawMode}
              title="Blockquote" // (Ctrl+Q)"
            >
              <FormatQuote />
            </RichEditorToolbarButton>
            <RichEditorToolbarButton
              action={editor.toggleCode}
              active={
                editor.isInBlocks(BLOCK_CODE) || editor.hasMark(MARK_CODE)
              }
              disabled={isRawMode}
              title="Code" // (Ctrl+`)"
            >
              <Code />
            </RichEditorToolbarButton>
            <RichEditorToolbarButton
              action={editor.toggleLink}
              active={editor.hasLink()}
              disabled={isRawMode}
              title="Insert link" // (Ctrl+K)"
            >
              <InsertLink />
            </RichEditorToolbarButton>
            <RichEditorToolbarButton
              action={this.startSelectingMedia}
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
      case INLINE_LINK: {
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
