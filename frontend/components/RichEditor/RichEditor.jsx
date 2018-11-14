'use strict'

import {debounce} from 'lib/util'
import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './RichEditor.css'

import Button from 'components/Button/Button'
import TextInput from 'components/TextInput/TextInput'

import marked from 'marked'
import pell from 'pell'
import TurndownService from 'turndown'

const MODE = {
  HTML: 'html',
  MARKDOWN: 'markdown',
  WYSIWYG: 'wysiwyg'
}

/**
 * A rich text editor.
 */
export default class RichEditor extends Component {
  static propTypes = {
    /**
     * The content of the editor.
     */
    children: proptypes.node,

    /**
     * The format used for input and output.
     */
    format: proptypes.oneOf([
      MODE.HTML,
      MODE.MARKDOWN
    ]),

    /**
     * Callback to be executed when the text loses focus (onBlur event).
     */
    onBlur: proptypes.func,

    /**
     * A callback function that is fired whenever the content changes.
     */
    onChange: proptypes.func,    

    /**
     * Callback to be executed when the text gains focus (onFocus event).
     */
    onFocus: proptypes.func,

    /**
     * The initial value of the editor.
     */
    value: proptypes.string
  }

  constructor(props) {
    super(props)

    this.state.html = null
    this.state.inEditLinkMode = false
    this.state.inFullscreenMode = false
    this.state.inTextMode = false
    this.state.editLinkText = null
    this.state.text = props.value
  }

  componentDidMount() {
    const {children, format, value} = this.props

    this.turndownService = new TurndownService({
      codeBlockStyle: 'fenced',
      headingStyle: 'atx'
    })

    this.turndownService.addRule('pre', {
      filter: (node, options) => {
        return node.classList.contains(styles.code)
      },
      replacement: (content, node) => {
        let language = typeof node.dataset.language === 'string' ?
          node.dataset.language :
          ''

        return '```' + language + '\n' + content + '\n```'
      }
    })    

    this.markdownRenderer = new marked.Renderer()

    this.markdownRenderer.code = (code, language = '') => {
      let escapedCode = code
         .replace(/&/g, '&amp;')
         .replace(/</g, '&lt;')
         .replace(/>/g, '&gt;')
         .replace(/"/g, '&quot;')
         .replace(/'/g, '&#039;')

      return `<pre class="${styles.code}" data-language="${language.trim()}">${escapedCode}</pre>`
    }

    // Initialize pell on an HTMLElement
    this.editor = pell.init({
      element: this.editorElement,
      onChange: this.handleChange.bind(this),
      actions: [
        {
          name: 'bold',
          icon: '<b>Bold</b>'
        },
        {
          name: 'italic',
          icon: '<i>Italic</i>'
        },
        {
          name: 'link',
          icon: 'Link',
          result: this.handleLinkModeSelect.bind(this),
          state: () => {
            return this.getNodeTagPathsInSelection().find(e => e.tagName === 'A')
          }          
        },
        {
          name: 'heading1',
          state: () => {
            return this.getNodeTagPathsInSelection().find(e => e.tagName === 'H1')
          }
        },
        {
          name: 'heading2',
          state: () => {
            return this.getNodeTagPathsInSelection().find(e => e.tagName === 'H2')
          }
        },
        {
          name: 'quote',
          icon: '<span>“</span>',
          state: () => {
            return this.getNodeTagPathsInSelection().find(e => e.tagName === 'BLOCKQUOTE')
          }
        },
        {
          name: 'olist',
          icon: '<span>1.</span>',
          title: 'Ordered list'
        },
        'ulist',
        {
          name: 'code',
          result: () => {
            let selection = window.getSelection()
            let html = `<pre class="${styles.code}">${selection.toString()}</pre>`

            pell.exec('insertHTML', html)
          }
        },
        {
          icon: `<span class="${styles['fullscreen-toggle']}">Fullscreen</span>`,
          title: 'Fullscreen',
          result: () => this.setState({
            inFullscreenMode: !this.state.inFullscreenMode
          })
        },
        {
          icon: `<span class="${styles['text-mode-toggle']}">Text</span>`,
          title: 'Text',
          result: () => this.setState({
            inTextMode: !this.state.inTextMode
          })
        }
      ],
      classes: {
        actionbar: styles['pell-actionbar'],
        button: styles['pell-button'],
        content: `${styles.editor} ${styles['editor-wysiwyg']}`,
        selected: styles['pell-button-selected']
      }
    })

    let initialValue = format === MODE.MARKDOWN ?
      this.getHTMLFromMarkdown(value) :
      value

    this.setEditorContents(initialValue)

    let editor = this.editorElement.getElementsByClassName(styles.editor)[0] 

    // These cause issues with the formatting
    //editor.addEventListener('blur', this.handleEvent.bind(this, 'onBlur'))
    //editor.addEventListener('focus', this.handleEvent.bind(this, 'onFocus'))
    
    this.selectionHandler = debounce(this.handleSelectionChange.bind(this), 200)

    document.addEventListener('selectionchange', this.selectionHandler)
  }

  componentDidUpdate(prevProps, prevState) {
    const {value} = this.props
    const {inEditLinkMode, text} = this.state

    // Saving selection before the user interacts with the modal and setting
    // the focus to the link input element.
    if (inEditLinkMode && !prevState.inEditLinkMode) {
      this.savedSelection = window.getSelection().getRangeAt(0)
      this.linkInputElement.focus()
    }

    if (value !== text) {
      this.handleChange(value, {
        needsConversion: true
      })
    }
  }

  getNodeTagPathsInSelection() {
    // This is a super basic caching mechanism that prevents this function from
    // traversing the DOM multiple times for the same selection. It keeps track
    // of the last tag path computed and the timestamp at which it occurred. If
    // another call comes in within the next millisecond, we reuse that value
    // instead of computing a new one.
    if (
      !this.nodeTagPathsTimestamp ||
      !this.nodeTagPaths ||
      ((this.nodeTagPathsTimestamp + 1) < Date.now())
    ) {
      let node = window.getSelection().focusNode
      let tags = []

      do {
        tags.push(node)
        node = node.tagName === 'BODY' ? null : node.parentNode
      } while (node && !node.classList.contains(styles['outer-wrapper']))

      this.nodeTagPaths = tags
      this.nodeTagPathsTimestamp = Date.now()
    }

    return this.nodeTagPaths
  }

  getHTMLFromText(text) {
    const {format} = this.props

    switch (format) {
      case MODE.HTML:
        return text

      case MODE.MARKDOWN:
        return this.getHTMLFromMarkdown(text)
    }
  }

  getHTMLFromMarkdown(markdown) {
    return marked(markdown, {
      renderer: this.markdownRenderer
    })
  }

  getMarkdownFromHTML(html) {
    return this.turndownService.turndown(html)
  }

  getTextFromHTML(html) {
    const {format} = this.props

    switch (format) {
      case MODE.HTML:
        return html

      case MODE.MARKDOWN:
        return this.getMarkdownFromHTML(html)
    }    
  }

  handleChange(value, {
    needsConversion = this.state.inTextMode
  } = {}) {
    const {format, onChange} = this.props

    let html
    let text

    if (needsConversion) {
      html = this.getHTMLFromText(value)
      text = value

      this.setEditorContents(html)
    } else {
      html = value
      text = this.getTextFromHTML(value)
    }

    // An empty string is not the best representation of an empty field.
    // We look for that case and broadcast a `null` instead.
    let sanitisedText = text.length > 0 ?
      text :
      null

    this.setState({
      html,
      text: sanitisedText
    })

    if (typeof onChange === 'function') {
      onChange(sanitisedText)
    }
  }

  handleLinkChange(event) {
    this.setState({
      editLinkText: event.target.value
    })
  }

  handleLinkModeSelect() {
    let selection = window.getSelection()

    this.savedSelection = selection.getRangeAt(0)
    
    pell.exec('insertHTML', `<span data-publish-link-edit="true">${selection.toString()}</span>`)

    this.editLinkNode = document.querySelector('[data-publish-link-edit="true"]')

    this.setState({
      inEditLinkMode: true
    })
  }

  handleLinkRemove() {
    if (this.editLinkNode) {
      this.setSelectionOnElement(this.editLinkNode)
    }

    pell.exec('unlink')

    this.setState({
      inEditLinkMode: false,
      editLinkText: null
    })
  }

  handleLinkSave() {
    const {editLinkText} = this.state

    event.preventDefault()

    if (this.editLinkNode) {
      delete this.editLinkNode.dataset.publishLinkEdit

      this.setSelectionOnElement(this.editLinkNode)
    }

    pell.exec('createLink', editLinkText)

    this.setState({
      inEditLinkMode: false,
      editLinkText: null
    })
  }

  handleSelectionChange(event) {
    if (this.isSettingSelection) {
      this.isSettingSelection = false

      return
    }

    const {
      editLinkText,
      inEditLinkMode
    } = this.state

    let tagPath = this.getNodeTagPathsInSelection()
    let linkElement
    let inEditor = tagPath.some(node => {
      if (node.tagName === 'A') {
        linkElement = node
      }

      return node.classList &&
        node.classList.contains(styles.editor)
    })

    // If the selection wasn't made somewhere within the editor, we don't care.
    if (!inEditor) return

    // If there was a link node previously stored, we reset its state.
    if (this.editLinkNode) {
      delete this.editLinkNode.dataset.publishLinkEdit
    }

    if (linkElement) {
      this.editLinkNode = linkElement
      this.editLinkNode.dataset.publishLinkEdit = true

      let href = linkElement.attributes.href.value

      if (inEditLinkMode) {
        // The user is already in the "edit link" mode but they have clicked on
        // another link. All we need to do is update the URL.
        this.setState({
          editLinkText: href
        })        
      } else {
        // If the user is selecting a link and entering the "edit link" mode, we
        // need to ensure that the selection encompasses the full length of the
        // linked text.
        this.savedSelection = this.setSelectionOnElement(linkElement)

        this.setState({
          editLinkText: href,
          inEditLinkMode: true
        })        
      }
    } else if (inEditLinkMode) {
      // User is leaving the "edit link" mode.
      this.setState({
        editLinkText: null,
        inEditLinkMode: false
      })
    }
  }  

  render() {
    const {children} = this.props
    const {
      editLinkText,
      html,
      inEditLinkMode,
      inFullscreenMode,
      inTextMode,
      text
    } = this.state
    const wrapper = new Style(styles, 'wrapper')
      .addIf('wrapper-mode-text', inTextMode)

    const outerWrapper = new Style(styles, 'outer-wrapper')
      .addIf('wrapper-mode-fullscreen', inFullscreenMode)

    // Prevent the body scrolling behind the overlay
    document.body.style.overflow = inFullscreenMode ? 'hidden' : 'visible' 

    const editorText = new Style(styles, 'editor', 'editor-text', 'content-height')

    return (
      <div class={outerWrapper.getClasses()}>
        {inEditLinkMode && (
          <form
            class={styles['link-modal']}
            onSubmit={this.handleLinkSave.bind(this)}
          >
            <input
              class={styles['link-input']}
              onInput={this.handleLinkChange.bind(this)}
              placeholder="Link address"
              ref={el => this.linkInputElement = el}
              type="text"
              value={editLinkText}
            />

            <Button
              accent="save"
              className={styles['link-control']}
              size="small"
              type="submit"
            >Save</Button>

            <Button
              accent="destruct"
              className={styles['link-control']}
              onClick={this.handleLinkRemove.bind(this)}
              size="small"
            >Remove</Button>
          </form>
        )}

        <div class={wrapper.getClasses()}>
          <div ref={el => this.editorElement = el} />

          {inTextMode && (
            <TextInput
              className={editorText.getClasses()}
              heightType="content"
              onBlur={this.handleEvent.bind(this, 'onBlur')}
              onFocus={this.handleEvent.bind(this, 'onFocus')}
              onChange={event => this.handleChange(event.target.value)}
              value={text}
              type="multiline"
            />
          )}
        </div>
      </div>
    )
  }

  setEditorContents(html) {
    this.editor.content.innerHTML = html
  }

  setSelection(range) {
    let selection = window.getSelection()

    this.isSettingSelection = true

    selection.removeAllRanges()
    selection.addRange(range)
  }

  setSelectionOnElement(element) {
    let range = document.createRange()

    range.setStart(element, 0)
    range.setEnd(element, 1)

    this.setSelection(range)

    return range
  }

  handleEvent(callback, event) {
    if (typeof this.props[callback] === 'function') {
      this.props[callback].call(this, event)
    }
  }
}
