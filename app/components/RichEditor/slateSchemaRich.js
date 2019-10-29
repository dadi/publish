import * as Nodes from './slateNodes'

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
    }
  ]
}
