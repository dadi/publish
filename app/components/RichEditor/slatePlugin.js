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
const isModLBr = isHotkey('mod+[')
const isModRBr = isHotkey('mod+]')
const isEnter = isHotkey('enter')
const isShiftEnter = isHotkey('shift+enter')
const isBackspace = isHotkey('backspace')
const isDelete = isHotkey('delete')

const isListNode = node =>
  node &&
  (node.type === Nodes.BLOCK_NUMBERED_LIST ||
    node.type === Nodes.BLOCK_BULLETED_LIST)
const isListItemNode = node => node && node.type === Nodes.BLOCK_LIST_ITEM

const canIndentListItems = (editor, items) =>
  items.size && editor.value.document.getPreviousSibling(items.first().key)

function indentListItems(editor, items) {
  const {document} = editor.value

  if (!items.size) return

  const previousSibling = document.getPreviousSibling(items.first().key)

  if (!previousSibling) return

  const targetList = previousSibling.nodes.last()
  const parentList = document.getParent(items.first().key)
  const listType = isListNode(targetList) ? targetList.type : parentList.type

  items.forEach(block => {
    editor.removeNodeByKey(block.key)
  })

  // This list will be merged with the target list during normalization.
  editor.insertNodeByKey(previousSibling.key, previousSibling.nodes.size, {
    object: 'block',
    type: listType,
    nodes: items
  })
}

const canDeindentListItems = (editor, items) =>
  items.size &&
  editor.value.document.getClosest(items.first().key, isListItemNode)

function deindentListItems(editor, items) {
  const {document} = editor.value

  if (!items.size) return

  const parentListItem = document.getClosest(items.first().key, isListItemNode)

  if (!parentListItem) return

  const innerList = document.getParent(items.first().key)
  const outerList = document.getParent(parentListItem.key)

  items.forEach(block => {
    editor.removeNodeByKey(block.key)
  })

  if (items.size === innerList.nodes.size) {
    // We're moving all of the items of the list; delete the list.
    editor.removeNodeByKey(innerList.key)
  }

  editor.insertFragmentByKey(
    outerList.key,
    outerList.nodes.findIndex(item => item === parentListItem) + 1,
    Document.create({nodes: items})
  )
}

function changeListIndentation(editor, change) {
  const {blocks, document, selection} = editor.value
  const {anchor, focus} = selection
  const {key: anchorKey, offset: anchorOffset} = anchor
  const {key: focusKey, offset: focusOffset} = focus
  const checkFn =
    change === 'increase' ? canIndentListItems : canDeindentListItems
  const moveFn = change === 'increase' ? indentListItems : deindentListItems

  const parentBlocks = blocks
    .map(({key}) => document.getParent(key))
    .skipUntil(isListItemNode)
    .takeWhile(isListItemNode)

  if (!parentBlocks.size) return

  const firstItemDepth = document.getDepth(parentBlocks.first().key)
  const higherLevelItemIndex = parentBlocks.findIndex(
    ({key}) => document.getDepth(key) < firstItemDepth
  )

  if (higherLevelItemIndex !== -1) {
    const higherLevelItemDepth = document.getDepth(
      parentBlocks.get(higherLevelItemIndex).key
    )
    const firstPart = parentBlocks
      .slice(0, higherLevelItemIndex)
      .filter(({key}) => document.getDepth(key) === firstItemDepth)
    const secondPart = parentBlocks
      .slice(higherLevelItemIndex)
      .filter(({key}) => document.getDepth(key) === higherLevelItemDepth)

    // Only proceed if all items can be moved.
    if (checkFn(editor, firstPart) && checkFn(editor, secondPart)) {
      moveFn(editor, firstPart)
      moveFn(editor, secondPart)
    }
  } else {
    moveFn(
      editor,
      parentBlocks.filter(({key}) => document.getDepth(key) === firstItemDepth)
    )
  }

  editor
    .moveAnchorTo(anchorKey, anchorOffset)
    .moveFocusTo(focusKey, focusOffset)
}

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

      const {blocks, document, selection} = editor.value
      const topLevelBlocks = blocks.map(
        block => document.getFurthestBlock(block.key) || block
      )
      const range = selection.moveToRangeOfNode(
        topLevelBlocks.first(),
        topLevelBlocks.last()
      )

      editor.wrapBlockAtRange(range, Nodes.BLOCK_BLOCKQUOTE)
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
        const re = RegExp(`(^|\n)${INDENT}`, 'g')
        const newText = text.replace(re, (match, group1, index) =>
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

    if (editor.isInList()) {
      const {blocks, document, selection} = editor.value
      const listItemAtStart =
        blocks.size && document.getClosest(blocks.first().key, isListItemNode)
      const listItemAtEnd =
        blocks.size && document.getClosest(blocks.last().key, isListItemNode)
      const isSelectionAtStart =
        blocks.size &&
        selection.start.isAtStartOfNode(listItemAtStart) &&
        selection.end.isAtStartOfNode(listItemAtStart)
      const isEmptyBlock =
        blocks.size === 1 &&
        listItemAtStart.nodes.size === 1 &&
        listItemAtStart.text === ''
      const prevItem = document.getPreviousSibling(listItemAtStart.key)
      const isPrevItemEmpty =
        prevItem && prevItem.nodes.size === 1 && prevItem.text === ''
      const isInTopLevelList = document.getDepth(listItemAtStart.key) === 2

      if (isEnter(e) && isEmptyBlock && isInTopLevelList) {
        return editor
          .setBlocks(Nodes.DEFAULT_BLOCK)
          .unwrapBlock(Nodes.BLOCK_LIST_ITEM)
          .unwrapBlock(Nodes.BLOCK_NUMBERED_LIST)
          .unwrapBlock(Nodes.BLOCK_BULLETED_LIST)
      }

      if (
        isEnter(e) &&
        isSelectionAtStart &&
        (!prevItem || isPrevItemEmpty) &&
        isInTopLevelList
      ) {
        if (isPrevItemEmpty) {
          const prevItemChildKey = prevItem.nodes.first().key

          return editor
            .unwrapBlockByKey(prevItemChildKey, Nodes.BLOCK_LIST_ITEM)
            .unwrapBlockByKey(prevItemChildKey, Nodes.BLOCK_NUMBERED_LIST)
            .unwrapBlockByKey(prevItemChildKey, Nodes.BLOCK_BULLETED_LIST)
        }

        return editor
          .insertBlock(Nodes.DEFAULT_BLOCK)
          .unwrapBlock(Nodes.BLOCK_LIST_ITEM)
          .unwrapBlock(Nodes.BLOCK_NUMBERED_LIST)
          .unwrapBlock(Nodes.BLOCK_BULLETED_LIST)
          .moveToStartOfNextBlock()
      }

      if (isBackspace(e) && isSelectionAtStart) {
        return isInTopLevelList
          ? editor
              .unwrapBlock(Nodes.BLOCK_LIST_ITEM)
              .unwrapBlock(Nodes.BLOCK_NUMBERED_LIST)
              .unwrapBlock(Nodes.BLOCK_BULLETED_LIST)
          : editor.deindent()
      }

      if (isEnter(e)) {
        return editor.splitBlock(2)
      }

      if (isDelete(e) && selection.end.isAtEndOfNode(listItemAtEnd)) {
        const nextListItem = document.getNextSibling(listItemAtEnd.key)

        if (!nextListItem) {
          next()

          return
        }

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
