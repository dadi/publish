import * as Nodes from './slateNodes'
import {isTouchDevice, openLinkPrompt} from './utils'
import {Document} from 'slate'
import isHotkey from 'is-hotkey'
import PlainSerializer from 'slate-plain-serializer'

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
const isDelete = isHotkey('delete')

const plugin = {
  commands: {
    toggleBlocks(editor, type) {
      editor
        .setBlocks(editor.isInBlocks(type) ? Nodes.DEFAULT_BLOCK : type)
        .unwrapBlock(Nodes.BLOCK_BULLETED_LIST)
        .unwrapBlock(Nodes.BLOCK_NUMBERED_LIST)
    },
    toggleBold(editor) {
      editor.toggleMark(Nodes.MARK_BOLD)
    },
    toggleItalic(editor) {
      editor.toggleMark(Nodes.MARK_ITALIC)
    },
    toggleCode(editor) {
      const {blocks, selection} = editor.value

      if (!blocks.size) return

      const isInCodeBlocks = editor.isInBlocks(Nodes.BLOCK_CODE)
      const isOnlyOneBlock = blocks.first() === blocks.last()
      const isNotWholeBlock = !(
        selection.start.isAtStartOfNode(blocks.first()) &&
        selection.end.isAtEndOfNode(blocks.last())
      )

      if (
        !blocks.size ||
        (!isInCodeBlocks && isOnlyOneBlock && isNotWholeBlock)
      ) {
        return editor.toggleMark(Nodes.MARK_CODE)
      }

      editor.moveToRangeOfNode(blocks.first(), blocks.last())

      // Code blocks have a single text leaf node containing the whole content
      // of the block; lines are separated by `\n`.
      if (isInCodeBlocks) {
        const lines = blocks
          .flatMap(codeBlock => codeBlock.text.split('\n'))
          .map(line => ({
            object: 'block',
            type: Nodes.DEFAULT_BLOCK,
            nodes: [{object: 'text', text: line}]
          }))

        return editor
          .delete()
          .setBlocks(Nodes.DEFAULT_BLOCK)
          .insertFragment(Document.create({nodes: lines}))
      }

      const text = PlainSerializer.serialize({
        document: editor.value.fragment
      })

      editor
        .delete()
        .setBlocks(Nodes.BLOCK_CODE)
        .insertText(text)
    },
    toggleHeading1(editor) {
      editor.toggleBlocks(Nodes.BLOCK_HEADING1)
    },
    toggleHeading2(editor) {
      editor.toggleBlocks(Nodes.BLOCK_HEADING2)
    },
    toggleHeading3(editor) {
      editor.toggleBlocks(Nodes.BLOCK_HEADING3)
    },
    toggleBlockquote(editor) {
      if (editor.isInBlockQuote()) {
        return editor.unwrapBlock(Nodes.BLOCK_BLOCKQUOTE)
      }

      editor.wrapBlock(Nodes.BLOCK_BLOCKQUOTE)
    },
    toggleNumberedList(editor) {
      if (editor.isInList(Nodes.BLOCK_NUMBERED_LIST)) {
        return editor
          .setBlocks(Nodes.DEFAULT_BLOCK)
          .unwrapBlock(Nodes.BLOCK_NUMBERED_LIST)
      }

      editor
        .setBlocks(Nodes.BLOCK_LIST_ITEM)
        .unwrapBlock(Nodes.BLOCK_BULLETED_LIST)
        .wrapBlock(Nodes.BLOCK_NUMBERED_LIST)
    },
    toggleBulletedList(editor) {
      if (editor.isInList(Nodes.BLOCK_BULLETED_LIST)) {
        return editor
          .setBlocks(Nodes.DEFAULT_BLOCK)
          .unwrapBlock(Nodes.BLOCK_BULLETED_LIST)
      }

      editor
        .setBlocks(Nodes.BLOCK_LIST_ITEM)
        .unwrapBlock(Nodes.BLOCK_NUMBERED_LIST)
        .wrapBlock(Nodes.BLOCK_BULLETED_LIST)
    },
    toggleLink(editor) {
      if (editor.hasLink()) {
        return editor.unwrapInline(Nodes.INLINE_LINK)
      }

      if (!editor.value.selection.isExpanded) return

      // On touch devices, we open a native prompt to input the link address.
      // On non-touch, we just wrap the text in a link node; the link prompt
      // component gets rendered as a part of rendering the link node.
      if (!isTouchDevice) {
        return editor.wrapInline({
          type: Nodes.INLINE_LINK,
          data: {href: ''}
        })
      }

      const href = openLinkPrompt()

      if (href !== '') {
        editor.wrapInline({type: Nodes.INLINE_LINK, data: {href}})
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
          ? editor.insertBlock(Nodes.DEFAULT_BLOCK)
          : editor.insertBlock(Nodes.DEFAULT_BLOCK).moveToStartOfNextBlock()
      }

      editor.splitBlock().setBlocks(Nodes.DEFAULT_BLOCK)
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
          block.type === Nodes.BLOCK_BLOCKQUOTE ||
          (furthestBlock && furthestBlock.type === Nodes.BLOCK_BLOCKQUOTE)
        )
      })
    },
    isInList(editor, type) {
      const {blocks, document} = editor.value

      return blocks.every(
        block =>
          block.type === Nodes.BLOCK_LIST_ITEM &&
          document.getParent(block.key).type === type
      )
    },
    hasMark(editor, type) {
      return editor.value.activeMarks.some(block => block.type === type)
    },
    hasLink(editor) {
      const {inlines} = editor.value

      return inlines.size === 1 && inlines.first().type === Nodes.INLINE_LINK
    },
    isInHeading(editor) {
      return editor.value.blocks.every(block =>
        Nodes.HEADINGS.includes(block.type)
      )
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
    const isEmptyBlock = blocks.size === 1 && blocks.first().text === ''

    if (isEnter(e)) {
      if (editor.isInHeading()) {
        return editor.splitHeading()
      }

      if (editor.isInBlocks(Nodes.BLOCK_CODE)) {
        return editor.insertText('\n')
      }

      if (editor.isInBlocks(Nodes.BLOCK_LIST_ITEM)) {
        if (isEmptyBlock) {
          return editor
            .setBlocks(Nodes.DEFAULT_BLOCK)
            .unwrapBlock(Nodes.BLOCK_NUMBERED_LIST)
            .unwrapBlock(Nodes.BLOCK_BULLETED_LIST)
        }

        if (isSelectionAtStart) {
          return editor
            .insertBlock(Nodes.DEFAULT_BLOCK)
            .unwrapBlock(Nodes.BLOCK_NUMBERED_LIST)
            .unwrapBlock(Nodes.BLOCK_BULLETED_LIST)
            .moveToStartOfNextBlock()
        }
      }
    }

    if (
      isBackspace(e) &&
      editor.isInBlocks(Nodes.BLOCK_LIST_ITEM) &&
      isSelectionAtStart
    ) {
      return editor
        .setBlocks(Nodes.DEFAULT_BLOCK)
        .unwrapBlock(Nodes.BLOCK_NUMBERED_LIST)
        .unwrapBlock(Nodes.BLOCK_BULLETED_LIST)
    }

    if (
      isDelete(e) &&
      editor.isInBlocks(Nodes.BLOCK_LIST_ITEM) &&
      isEmptyBlock
    ) {
      next()

      return editor.moveToStartOfNextBlock()
    }

    next()
  }
}

export default [plugin]
