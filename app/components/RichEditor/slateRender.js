import * as Nodes from './slateNodes'
import React from 'react'
import Style from 'lib/Style'
import styles from './RichEditor.css'

const listTypes = [Nodes.BLOCK_BULLETED_LIST, Nodes.BLOCK_NUMBERED_LIST]

export function renderBlock(props, _, next) {
  const {attributes, children, isFocused, node} = props

  switch (node.type) {
    case Nodes.BLOCK_CODE: {
      const language = node.data.get('language')

      return (
        <pre {...attributes}>
          <code className={language && `language-${language}`}>{children}</code>
        </pre>
      )
    }

    case Nodes.BLOCK_BLOCKQUOTE:
      return <blockquote {...attributes}>{children}</blockquote>

    case Nodes.BLOCK_BULLETED_LIST:
      return <ul {...attributes}>{children}</ul>

    case Nodes.DEFAULT_BLOCK:
      return children[0] &&
        children[0].props.node.type === Nodes.BLOCK_IMAGE ? (
        <div {...attributes}>{children}</div>
      ) : (
        <p {...attributes}>{children}</p>
      )

    case Nodes.BLOCK_HEADING1:
      return (
        <h1 {...attributes} className={styles.heading}>
          {children}
        </h1>
      )

    case Nodes.BLOCK_HEADING2:
      return (
        <h2 {...attributes} className={styles.heading}>
          {children}
        </h2>
      )

    case Nodes.BLOCK_HEADING3:
      return (
        <h3 {...attributes} className={styles.heading}>
          {children}
        </h3>
      )

    case Nodes.BLOCK_HEADING4:
      return (
        <h4 {...attributes} className={styles.heading}>
          {children}
        </h4>
      )

    case Nodes.BLOCK_HEADING5:
      return (
        <h5 {...attributes} className={styles.heading}>
          {children}
        </h5>
      )

    case Nodes.BLOCK_HEADING6:
      return (
        <h6 {...attributes} className={styles.heading}>
          {children}
        </h6>
      )

    case Nodes.BLOCK_HR:
      return <hr />

    case Nodes.BLOCK_IMAGE: {
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
            title={node.data.get('title')}
          />
        </div>
      )
    }

    case Nodes.BLOCK_LIST_ITEM: {
      // Simple list items (containing a paragraph and a nested list) are rendered
      // without a margin between the two children.
      const isSimpleListItem =
        children.length === 2 &&
        children[0].props.node.type === Nodes.DEFAULT_BLOCK &&
        listTypes.includes(children[1].props.node.type)

      return (
        <li
          {...attributes}
          className={isSimpleListItem ? styles['simple-list-item'] : undefined}
        >
          {children}
        </li>
      )
    }

    case Nodes.BLOCK_NUMBERED_LIST:
      return <ol {...attributes}>{children}</ol>

    default:
      return next()
  }
}

export function renderMark({children, mark, attributes}, _, next) {
  switch (mark.type) {
    case Nodes.MARK_BOLD:
      return <strong {...attributes}>{children}</strong>

    case Nodes.MARK_CODE:
      return <code {...attributes}>{children}</code>

    case Nodes.MARK_ITALIC:
      return <em {...attributes}>{children}</em>

    case Nodes.MARK_DEL:
      return <del {...attributes}>{children}</del>

    default:
      return next()
  }
}
