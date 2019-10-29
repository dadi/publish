import * as Nodes from './slateNodes'
import {Document} from 'slate'

export const isListNode = node =>
  node &&
  (node.type === Nodes.BLOCK_NUMBERED_LIST ||
    node.type === Nodes.BLOCK_BULLETED_LIST)

export const isListItemNode = node =>
  node && node.type === Nodes.BLOCK_LIST_ITEM

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

export function changeListIndentation(editor, change) {
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
