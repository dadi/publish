import * as Nodes from './slateNodes'

// Blocks such that if they are at the edge of the document or next to another
// nonexitable block, it's impossible to insert a regular paragraph in between
// without using keyboard shortcuts.
const nonexitableNodes = [
  Nodes.BLOCK_CODE,
  Nodes.BLOCK_BLOCKQUOTE,
  Nodes.BLOCK_HR,
  Nodes.BLOCK_IMAGE
]

const defaultBlock = {
  object: 'block',
  type: Nodes.DEFAULT_BLOCK
}

export default {
  blocks: {
    [Nodes.BLOCK_IMAGE]: {isVoid: true},
    [Nodes.BLOCK_HR]: {isVoid: true}
  },
  rules: [
    // Merge adjacent lists of the same type.
    {
      match: {type: Nodes.BLOCK_NUMBERED_LIST},
      next: {type: type => type !== Nodes.BLOCK_NUMBERED_LIST},
      normalize(editor, error) {
        if (error.code === 'next_sibling_type_invalid') {
          editor.mergeNodeByKey(error.next.key)
        }
      }
    },
    {
      match: {type: Nodes.BLOCK_BULLETED_LIST},
      next: {type: type => type !== Nodes.BLOCK_BULLETED_LIST},
      normalize(editor, error) {
        if (error.code === 'next_sibling_type_invalid') {
          editor.mergeNodeByKey(error.next.key)
        }
      }
    },

    // List items can only contain blocks.
    {
      match: {type: Nodes.BLOCK_LIST_ITEM},
      nodes: [{object: 'block'}],
      normalize(editor, error) {
        if (error.code === 'child_object_invalid') {
          editor.wrapBlockByKey(error.child.key, Nodes.DEFAULT_BLOCK)
        }
      }
    },

    // Unwrap list items whose first child is another list.
    {
      match: {type: Nodes.BLOCK_LIST_ITEM},
      first: {
        type: type =>
          type !== Nodes.BLOCK_NUMBERED_LIST &&
          type !== Nodes.BLOCK_BULLETED_LIST
      },
      normalize(editor, error) {
        if (error.code === 'first_child_type_invalid') {
          editor
            .unwrapNodeByKey(error.child.key)
            .unwrapNodeByKey(error.child.key)
        }
      }
    },

    // Make sure nonexitable blocks are surrounded by lines so that we can exit them.
    {
      match: {type: type => nonexitableNodes.includes(type)},
      previous: {type: type => !nonexitableNodes.includes(type)},
      next: {type: type => !nonexitableNodes.includes(type)},
      normalize(editor, error) {
        const {document} = editor.value
        const parent = document.getParent(error.node.key) || document
        const index = parent.nodes.indexOf(
          error.code === 'previous_sibling_type_invalid'
            ? error.node
            : error.next
        )

        editor.insertNodeByKey(parent.key, index, defaultBlock)
      }
    },

    {
      match: {object: 'document'},
      first: {type: type => !nonexitableNodes.includes(type)},
      last: {type: type => !nonexitableNodes.includes(type)},
      normalize(editor, error) {
        const {document} = editor.value
        const index =
          error.code === 'first_child_type_invalid' ? 0 : document.nodes.size

        editor.insertNodeByKey(document.key, index, defaultBlock)
      }
    }
  ]
}
