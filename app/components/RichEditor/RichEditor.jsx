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
import {RichEditorToolbar, RichEditorToolbarButton} from './RichEditorToolbar'
import {Editor} from 'slate-react'
import FullscreenComp from 'components/Fullscreen/Fullscreen'
import HotKeys from 'lib/hot-keys'
import {Markdown} from 'mdi-material-ui'
import MarkdownSerializer from '@edithq/slate-md-serializer'
import PlainSerializer from 'slate-plain-serializer'
import proptypes from 'prop-types'
import React from 'react'
import ReferenceSelectView from 'views/ReferenceSelectView/ReferenceSelectView'
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

const INLINE_LINK = 'link'

const MARK_BOLD = 'bold'
const MARK_CODE = 'code'
const MARK_ITALIC = 'italic'

const SCHEMA_RAW = {
  document: {
    nodes: [
      {
        match: [{type: 'line'}]
      }
    ]
  },
  blocks: {
    line: {
      nodes: [
        {
          match: {object: 'text'}
        }
      ]
    }
  }
}
const SCHEMA_RICH = {
  blocks: {
    image: {
      isVoid: true
    }
  }
}

// http://www.stucox.com/blog/you-cant-detect-a-touchscreen/
const isTouchDevice = window.matchMedia('(pointer: coarse)').matches

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

    this.handleChange = this.handleChange.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.handleMediaInsert = this.handleMediaInsert.bind(this)
    this.handleSave = this.handleSave.bind(this)
    this.handleToggleFullscreen = this.handleToggleFullscreen.bind(this)
    this.handleToggleRawMode = this.handleToggleRawMode.bind(this)
    this.renderBlock = this.renderBlock.bind(this)
    this.renderInline = this.renderInline.bind(this)
    this.renderMark = this.renderMark.bind(this)
    this.startSelectingMedia = () => this.setState({isSelectingMedia: true})
    this.stopSelectingMedia = () => this.setState({isSelectingMedia: false})
    this.validate = this.validate.bind(this)

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
      onSaveRegister(this.handleSave)
    }

    if (typeof onValidateRegister === 'function') {
      onValidateRegister(this.validate)
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

    onChange.call(this, value)
  }

  handleLinkClick(node, currentHref, event) {
    event.preventDefault()

    const newHref = this.openLinkPrompt(currentHref)

    return this.handleLinkUpdate(node, newHref)
  }

  handleLinkUpdate(node, href) {
    if (href === '') {
      return this.editor.unwrapInlineByKey(node.key, INLINE_LINK)
    }

    this.editor.setNodeByKey(node.key, {
      data: {href}
    })
  }

  handleMediaInsert(mediaSelection) {
    const {isRawMode} = this.state

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

      this.editor.insertBlock('paragraph')
    })
  }

  handleSave({value}) {
    return this.serialise(value)
  }

  handleToggleBlock(type) {
    if (this.state.isRawMode) {
      return
    }

    if (type !== BLOCK_BULLETED_LIST && type !== BLOCK_NUMBERED_LIST) {
      const isActive = this.hasBlock(type)
      const isList = this.hasBlock(BLOCK_LIST_ITEM)

      if (isList) {
        this.editor
          .setBlocks(isActive ? DEFAULT_NODE : type)
          .unwrapBlock(BLOCK_BULLETED_LIST)
          .unwrapBlock(BLOCK_NUMBERED_LIST)
      } else {
        this.editor.setBlocks(isActive ? DEFAULT_NODE : type)
      }
    } else {
      const {document} = this.value
      const isList = this.hasBlock(BLOCK_LIST_ITEM)
      const isType = this.value.blocks.some(block => {
        return Boolean(
          document.getClosest(block.key, parent => parent.type === type)
        )
      })

      if (isList && isType) {
        this.editor
          .setBlocks(DEFAULT_NODE)
          .unwrapBlock(BLOCK_BULLETED_LIST)
          .unwrapBlock(BLOCK_NUMBERED_LIST)
      } else if (isList) {
        const oldListType =
          type === BLOCK_BULLETED_LIST
            ? BLOCK_NUMBERED_LIST
            : BLOCK_BULLETED_LIST

        this.editor.unwrapBlock(oldListType).wrapBlock(type)
      } else {
        this.editor.setBlocks(BLOCK_LIST_ITEM).wrapBlock(type)
      }
    }
  }

  handleToggleCode(valueIsCodeBlock, valueIsCodeMark) {
    if (valueIsCodeBlock) {
      return this.editor.setBlocks(DEFAULT_NODE)
    }

    if (valueIsCodeMark) {
      return this.editor.toggleMark(MARK_CODE)
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
      this.editor.setBlocks(BLOCK_CODE)
    } else {
      this.editor.toggleMark(MARK_CODE)
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
      return this.editor.unwrapInline(INLINE_LINK)
    }

    if (this.value.selection.isExpanded) {
      if (isTouchDevice) {
        const href = this.openLinkPrompt()

        if (href !== '') {
          this.editor.wrapInline({
            type: INLINE_LINK,
            data: {
              href
            }
          })
        }

        return
      }

      this.editor.wrapInline({
        type: INLINE_LINK,
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
        this.hasBlock(BLOCK_LIST_ITEM) && parent && parent.type === type
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
    const {isFullscreen, isSelectingMedia} = this.state

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

    if (isFullscreen) {
      return <FullscreenComp>{this.renderEditor()}</FullscreenComp>
    }

    return this.renderEditor()
  }

  renderBlock(props, _, next) {
    const {attributes, children, isFocused, node} = props

    switch (node.type) {
      case BLOCK_CODE: {
        const language = node.data.get('language')

        return (
          <pre {...attributes}>
            <code className={language && `language-${language}`}>
              {children}
            </code>
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
            <img {...attributes} src={node.data.get('src')} />
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

  renderEditor() {
    const {isFullscreen, isRawMode} = this.state
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

    // Deserialising the value and caching the result, so that other methods
    // can use it.
    this.value = this.deserialise(this.props.value)

    const valueIsCodeBlock = this.hasBlock(BLOCK_CODE)
    const valueIsCodeMark = this.hasMark(MARK_CODE)
    const valueIsLink = this.hasInline(INLINE_LINK)

    return (
      <div className={containerStyle.getClasses()}>
        <RichEditorToolbar isFullscreen={isFullscreen}>
          <div>
            <RichEditorToolbarButton
              action={this.handleToggleMark.bind(this, MARK_BOLD)}
              active={this.hasMark(MARK_BOLD)}
              disabled={isRawMode}
              title="Bold (Ctrl+B)"
            >
              <FormatBold />
            </RichEditorToolbarButton>
            <RichEditorToolbarButton
              action={this.handleToggleMark.bind(this, MARK_ITALIC)}
              active={this.hasMark(MARK_ITALIC)}
              disabled={isRawMode}
              title="Italic (Ctrl+I)"
            >
              <FormatItalic />
            </RichEditorToolbarButton>
            <RichEditorToolbarButton
              action={this.handleToggleBlock.bind(this, BLOCK_HEADING1)}
              active={this.hasBlock(BLOCK_HEADING1)}
              disabled={isRawMode}
              title="Heading 1 (Ctrl+Alt+1)"
            >
              <span className={styles['toolbar-heading-icon']}>H1</span>
            </RichEditorToolbarButton>
            <RichEditorToolbarButton
              action={this.handleToggleBlock.bind(this, BLOCK_HEADING2)}
              active={this.hasBlock(BLOCK_HEADING2)}
              disabled={isRawMode}
              title="Heading 2 (Ctrl+Alt+2)"
            >
              <span className={styles['toolbar-heading-icon']}>H2</span>
            </RichEditorToolbarButton>
            <RichEditorToolbarButton
              action={this.handleToggleBlock.bind(this, BLOCK_HEADING3)}
              active={this.hasBlock(BLOCK_HEADING3)}
              disabled={isRawMode}
              title="Heading 3 (Ctrl+Alt+3)"
            >
              <span className={styles['toolbar-heading-icon']}>H3</span>
            </RichEditorToolbarButton>
            <RichEditorToolbarButton
              action={this.handleToggleBlock.bind(this, BLOCK_NUMBERED_LIST)}
              active={this.isListOfType(BLOCK_NUMBERED_LIST)}
              disabled={isRawMode}
              title="Numbered list (Ctrl+Shift+7)"
            >
              <FormatListNumbered />
            </RichEditorToolbarButton>
            <RichEditorToolbarButton
              action={this.handleToggleBlock.bind(this, BLOCK_BULLETED_LIST)}
              active={this.isListOfType(BLOCK_BULLETED_LIST)}
              disabled={isRawMode}
              title="Bulleted list (Ctrl+Shift+8)"
            >
              <FormatListBulleted />
            </RichEditorToolbarButton>
            <RichEditorToolbarButton
              action={() => {
                /* TODO */
              }}
              disabled={isRawMode}
              title="Decrease indent (Ctrl+[)"
            >
              <FormatIndentDecrease />
            </RichEditorToolbarButton>
            <RichEditorToolbarButton
              action={() => {
                /* TODO */
              }}
              disabled={isRawMode}
              title="Increase indent (Ctrl+])"
            >
              <FormatIndentIncrease />
            </RichEditorToolbarButton>
            <RichEditorToolbarButton
              action={this.handleToggleBlock.bind(this, BLOCK_BLOCKQUOTE)}
              active={this.hasBlock(BLOCK_BLOCKQUOTE)}
              disabled={isRawMode}
              title="Blockquote (Ctrl+Q)"
            >
              <FormatQuote />
            </RichEditorToolbarButton>
            <RichEditorToolbarButton
              action={this.handleToggleCode.bind(
                this,
                valueIsCodeBlock,
                valueIsCodeMark
              )}
              active={valueIsCodeBlock || valueIsCodeMark}
              disabled={isRawMode}
              title="Preformatted (Ctrl+`)"
            >
              <Code />
            </RichEditorToolbarButton>
            <RichEditorToolbarButton
              action={this.handleToggleLink.bind(this, valueIsLink)}
              active={valueIsLink}
              disabled={isRawMode}
              title="Insert link (Ctrl+K)"
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
              action={this.handleToggleRawMode}
              active={isRawMode}
              title="Markdown mode"
            >
              <Markdown />
            </RichEditorToolbarButton>
            <RichEditorToolbarButton
              action={this.handleToggleFullscreen}
              title="Fullscreen"
            >
              {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
            </RichEditorToolbarButton>
          </div>
        </RichEditorToolbar>

        <div
          className={editorWrapperStyle.getClasses()}
          ref={el => (this.container = el)}
        >
          <Editor
            className={editorStyle.getClasses()}
            onChange={this.handleChange}
            onKeyDown={this.handleKeyDown}
            renderBlock={this.renderBlock}
            renderInline={this.renderInline}
            renderMark={this.renderMark}
            ref={el => (this.editor = el)}
            schema={isRawMode ? SCHEMA_RAW : SCHEMA_RICH}
            value={this.value}
          />
        </div>
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

  renderMark({children, mark, attributes}, _, next) {
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
