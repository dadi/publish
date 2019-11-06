import * as Nodes from './slateNodes'
import {changeListIndentation, isListItemNode} from './listIndentationUtils'
import {isTouchDevice, openLinkPrompt} from './utils'
import {Document} from 'slate'
import isHotkey from 'is-hotkey'
import PlainSerializer from 'slate-plain-serializer'

const isModB = isHotkey('mod+b')
const isModI = isHotkey('mod+i')
const isModAltS = isHotkey('mod+alt+s')
const isModBacktick = isHotkey('mod+`')
const isModQ = isHotkey('mod+q')
const isModK = isHotkey('mod+k')
const isModAlt1 = isHotkey('mod+alt+1')
const isModAlt2 = isHotkey('mod+alt+2')
const isModAlt3 = isHotkey('mod+alt+3')
const isModAltN = isHotkey('mod+alt+n')
const isModAltB = isHotkey('mod+alt+b')
const isModLBr = isHotkey('mod+[')
const isModRBr = isHotkey('mod+]')
const isEnter = isHotkey('enter')
const isShiftEnter = isHotkey('shift+enter')
const isBackspace = isHotkey('backspace')
const isDelete = isHotkey('delete')

const plugin = {
  commands: {
    toggleBlocks(editor, type) {
      editor.setBlocks(editor.isInBlocks(type) ? Nodes.DEFAULT_BLOCK : type)
    },
    toggleBold(editor) {
      !editor.isInBlocks(Nodes.BLOCK_CODE) && editor.toggleMark(Nodes.MARK_BOLD)
    },
    toggleItalic(editor) {
      !editor.isInBlocks(Nodes.BLOCK_CODE) &&
        editor.toggleMark(Nodes.MARK_ITALIC)
    },
    toggleStrikethrough(editor) {
      !editor.isInBlocks(Nodes.BLOCK_CODE) && editor.toggleMark(Nodes.MARK_DEL)
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

      editor.withoutNormalizing(() => {
        const {document, selection} = editor.value
        const topLevelBlocks = document.getRootBlocksAtRange(selection)

        topLevelBlocks.forEach(({key}) => {
          editor.wrapBlockByKey(key, Nodes.BLOCK_BLOCKQUOTE)
        })

        const {document: newDocument, selection: newSelection} = editor.value
        const newTopLevelBlocks = newDocument.getRootBlocksAtRange(newSelection)

        newTopLevelBlocks.rest().forEach(({key}) => {
          editor.mergeNodeByKey(key)
        })
      })
    },
    toggleNumberedList(editor) {
      const {blocks, document} = editor.value

      if (editor.isInNumberedList()) {
        return editor
          .unwrapBlock(Nodes.BLOCK_LIST_ITEM)
          .unwrapBlock(Nodes.BLOCK_NUMBERED_LIST)
      }

      blocks.forEach(block => {
        const parent = document.getParent(block.key)

        if (!parent || parent.type !== Nodes.BLOCK_LIST_ITEM) {
          editor
            .setNodeByKey(block.key, Nodes.DEFAULT_BLOCK)
            .wrapBlockByKey(block.key, Nodes.BLOCK_NUMBERED_LIST)
            .wrapBlockByKey(block.key, Nodes.BLOCK_LIST_ITEM)
        } else if (parent) {
          const grandparent = document.getParent(parent.key)

          if (grandparent.type === Nodes.BLOCK_BULLETED_LIST) {
            editor.setNodeByKey(grandparent.key, Nodes.BLOCK_NUMBERED_LIST)
          }
        }
      })
    },
    toggleBulletedList(editor) {
      const {blocks, document} = editor.value

      if (editor.isInBulletedList()) {
        return editor
          .unwrapBlock(Nodes.BLOCK_LIST_ITEM)
          .unwrapBlock(Nodes.BLOCK_BULLETED_LIST)
      }

      blocks.forEach(block => {
        const parent = document.getParent(block.key)

        if (!parent || parent.type !== Nodes.BLOCK_LIST_ITEM) {
          editor
            .setNodeByKey(block.key, Nodes.DEFAULT_BLOCK)
            .wrapBlockByKey(block.key, Nodes.BLOCK_BULLETED_LIST)
            .wrapBlockByKey(block.key, Nodes.BLOCK_LIST_ITEM)
        } else if (parent) {
          const grandparent = document.getParent(parent.key)

          if (grandparent.type === Nodes.BLOCK_NUMBERED_LIST) {
            editor.setNodeByKey(grandparent.key, Nodes.BLOCK_BULLETED_LIST)
          }
        }
      })
    },
    toggleLink(editor) {
      if (editor.isInBlocks(Nodes.BLOCK_CODE)) return

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
    },
    indent(editor) {
      const {blocks, document, selection} = editor.value

      if (editor.isInBlocks(Nodes.BLOCK_CODE) && blocks.size === 1) {
        const INDENT = '  '
        const {start, end} = selection

        // A code block always contains exactly one text block (no marks or inlines).
        const {key, offset: startOffset} = start
        const {offset: endOffset} = end
        const {text} = document.getNode(key)
        const path = document.getPath(key)
        const startIndex = text.lastIndexOf('\n', startOffset - 1)
        const newText = text.replace(/^|\n/g, (match, index) =>
          index >= startIndex && (index < endOffset || match === '')
            ? match + INDENT
            : match
        )
        const lengthDiff = newText.length - text.length
        const newAnchorOffset = selection.isForward
          ? startOffset + INDENT.length
          : endOffset + lengthDiff
        const newFocusOffset = selection.isBackward
          ? startOffset + INDENT.length
          : endOffset + lengthDiff

        editor
          // `setNodeByKey` doesn't work with changing text. Implementation using
          // `insertText` (preserves selection offsets even through undos) turned
          // out to be too complex.
          .replaceNodeByKey(key, {object: 'text', text: newText})
          .moveAnchorTo(path, newAnchorOffset)
          .moveFocusTo(path, newFocusOffset)
      } else {
        changeListIndentation(editor, 'increase')
      }
    },
    deindent(editor) {
      const {blocks, document, selection} = editor.value

      if (editor.isInBlocks(Nodes.BLOCK_CODE) && blocks.size === 1) {
        const INDENT = '  '
        const {start, end} = selection
        const {key, offset: startOffset} = start
        const {offset: endOffset} = end
        const {text} = document.getNode(key)
        const path = document.getPath(key)
        const startIndex = text.lastIndexOf('\n', startOffset - 1)
        const lineIndentations = RegExp(`(^|\n)${INDENT}`, 'g')
        const newText = text.replace(lineIndentations, (match, group1, index) =>
          index >= startIndex && (index < endOffset || match === INDENT)
            ? group1
            : match
        )
        const lengthDiff = text.length - newText.length
        const newAnchorOffset = selection.isForward
          ? startOffset - INDENT.length
          : endOffset - lengthDiff
        const newFocusOffset = selection.isBackward
          ? startOffset - INDENT.length
          : endOffset - lengthDiff

        editor
          .replaceNodeByKey(key, {object: 'text', text: newText})
          .moveAnchorTo(path, newAnchorOffset)
          .moveFocusTo(path, newFocusOffset)
      } else {
        changeListIndentation(editor, 'decrease')
      }
    },
    unwrapFromList(editor, key) {
      if (key) {
        editor
          .unwrapBlockByKey(key, Nodes.BLOCK_LIST_ITEM)
          .unwrapBlockByKey(key, Nodes.BLOCK_NUMBERED_LIST)
          .unwrapBlockByKey(key, Nodes.BLOCK_BULLETED_LIST)
      } else {
        editor
          .unwrapBlock(Nodes.BLOCK_LIST_ITEM)
          .unwrapBlock(Nodes.BLOCK_NUMBERED_LIST)
          .unwrapBlock(Nodes.BLOCK_BULLETED_LIST)
      }
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

      return blocks.every(block => {
        const parent = document.getParent(block.key)

        if (!parent || parent.type !== Nodes.BLOCK_LIST_ITEM) return false

        const grandparent = document.getParent(parent.key)

        return type
          ? grandparent.type === type
          : [Nodes.BLOCK_NUMBERED_LIST, Nodes.BLOCK_BULLETED_LIST].includes(
              grandparent.type
            )
      })
    },
    isInBulletedList(editor) {
      return editor.isInList(Nodes.BLOCK_BULLETED_LIST)
    },
    isInNumberedList(editor) {
      return editor.isInList(Nodes.BLOCK_NUMBERED_LIST)
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

    if (isModAltS(e)) {
      return editor.toggleStrikethrough()
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

    if (isModLBr(e)) {
      return editor.deindent()
    }

    if (isModRBr(e)) {
      return editor.indent()
    }

    if (isShiftEnter(e) && !editor.isInList()) {
      // Lists skipped here because in lists, Shift+Enter has the default behavior
      // (split the paragraph block), whereas Enter splits the whole list item.
      return editor.insertText('\n')
    }

    if (isEnter(e)) {
      if (editor.isInHeading() && !editor.isInList()) {
        return editor.splitHeading()
      }

      if (editor.isInBlocks(Nodes.BLOCK_CODE)) {
        return editor.insertText('\n')
      }
    }

    const {blocks, document, selection} = editor.value

    if (isBackspace(e) && editor.isInBlockQuote() && !editor.isInList()) {
      const isCursorAtStartOfBlock =
        selection.isCollapsed && selection.start.isAtStartOfNode(blocks.first())

      if (isCursorAtStartOfBlock) {
        return editor.toggleBlockquote()
      }
    }

    if (editor.isInList()) {
      const itemAtStart = document.getParent(blocks.first().key)
      const itemAtEnd = document.getParent(blocks.last().key)
      const isCursorAtStartOfItem =
        selection.isCollapsed && selection.start.isAtStartOfNode(itemAtStart)
      const isItemEmpty = blocks.size === 1 && itemAtStart.text === ''
      const prevItem = document.getPreviousSibling(itemAtStart.key)
      const isPrevItemEmpty = prevItem && prevItem.text === ''
      const listBlock = document.getParent(itemAtStart.key)
      const parentOfList = document.getParent(listBlock.key)
      const isInTopLevelList =
        !parentOfList || parentOfList.type !== Nodes.BLOCK_LIST_ITEM

      if (isEnter(e) && isItemEmpty && isInTopLevelList) {
        return editor.setBlocks(Nodes.DEFAULT_BLOCK).unwrapFromList()
      }

      if (
        isEnter(e) &&
        isCursorAtStartOfItem &&
        (!prevItem || isPrevItemEmpty) &&
        isInTopLevelList
      ) {
        return isPrevItemEmpty
          ? editor.unwrapFromList(prevItem.nodes.first().key)
          : editor
              // First item in a top level list--insert a paragraph before it.
              .insertBlock(Nodes.DEFAULT_BLOCK)
              .unwrapFromList()
              .moveToStartOfNextBlock()
      }

      if (isBackspace(e) && isCursorAtStartOfItem) {
        return isInTopLevelList ? editor.unwrapFromList() : editor.deindent()
      }

      if (isEnter(e)) {
        return editor.splitBlock(2)
      }

      if (isDelete(e) && selection.end.isAtEndOfNode(itemAtEnd)) {
        const nextListItem = document.getNextSibling(itemAtEnd.key)

        if (!nextListItem) return next()

        const firstChild = nextListItem.nodes.first()

        return editor
          .delete()
          .mergeNodeByKey(nextListItem.key)
          .mergeNodeByKey(firstChild.key)
      }
    }

    next()
  }
}

export default [plugin]
