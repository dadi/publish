import * as Nodes from './slateNodes'

export default {
  blocks: {
    [Nodes.BLOCK_IMAGE]: {isVoid: true},
    [Nodes.BLOCK_HR]: {isVoid: true}
  },
  rules: [
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
    }
  ]
}
