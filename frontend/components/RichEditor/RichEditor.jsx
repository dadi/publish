'use strict'

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
    this.state.inTextMode = false
    this.state.inFullscreenMode = false
    this.state.linkBeingEdited = null
    this.state.showLinkModal = false
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
          icon: '<b>Bold</b>',
          state: () => {
            let tag = window.getSelection().focusNode.parentNode.tagName

            return tag === 'B' ||
              tag === 'STRONG'
          }
        },
        {
          name: 'italic',
          icon: '<i>Italic</i>'
        },
        {
          name: 'link',
          icon: 'Link',
          result: () => this.setState({
            showLinkModal: true
          })
        },
        {
          name: 'heading1',
          state: () => {
            return window.getSelection().focusNode.parentNode.tagName === 'H1'
          }
        },
        {
          name: 'heading2',
          state: () => {
            return window.getSelection().focusNode.parentNode.tagName === 'H2'
          }
        },
        {
          name: 'quote',
          icon: '<span>“</span>'
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
    editor.addEventListener('click', this.handleClick.bind(this))
  }

  componentDidUpdate(prevProps, prevState) {
    const {value} = this.props
    const {showLinkModal, text} = this.state

    // Saving selection before the user interacts with the modal and setting
    // the focus to the link input element.
    if (showLinkModal && !prevState.showLinkModal) {
      this.selection = window.getSelection().getRangeAt(0)
      this.linkInputElement.focus()
    }

    if (value !== text) {
      this.handleChange(value, {
        fromTextMode: true
      })
    }
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
    fromTextMode = this.state.inTextMode,
    initialRender
  } = {}) {
    const {format, onChange} = this.props

    let html
    let text

    if (fromTextMode) {
      html = this.getHTMLFromText(value)
      text = value
    } else {
      html = value
      text = this.getTextFromHTML(value)
    }

    this.setState({
      html,
      text
    })

    if (initialRender || fromTextMode) {
      this.setEditorContents(html)
    }

    if (!initialRender && (typeof onChange === 'function')) {
      onChange(text)
    }
  }

  handleClick(event) {
    const {linkBeingEdited} = this.state
    const {target} = event

    if (target.tagName !== 'A') {
      this.setState({
        linkBeingEdited: null,
        showLinkModal: false
      })

      return
    }

    let href = target.attributes.href.value
    let range = document.createRange()

    range.setStart(target, 0)
    range.setEnd(target, 1)    

    this.setSelection(range)
    this.selection = range

    this.setState({
      linkBeingEdited: href,
      showLinkModal: true
    })
  }

  handleLinkChange(event) {
    this.setState({
      linkBeingEdited: event.target.value
    })
  }

  handleLinkRemove() {
    const {linkRange} = this.state

    if (linkRange) {
      this.setSelection(linkRange)
    }

    pell.exec('unlink')

    this.setState({
      linkBeingEdited: null,
      showLinkModal: false
    })
  }

  handleLinkSave(event) {
    const {linkBeingEdited} = this.state

    event.preventDefault()

    if (this.selection) {
      this.setSelection(this.selection)  
    }

    pell.exec('createLink', linkBeingEdited)

    this.setState({
      linkBeingEdited: null,
      showLinkModal: false
    })
  }

  render() {
    const {children} = this.props
    const {
      html,
      inFullscreenMode,
      inTextMode,
      linkBeingEdited,
      showLinkModal,
      text
    } = this.state
    const wrapper = new Style(styles, 'wrapper')
      .addIf('wrapper-mode-text', inTextMode)

    const outerWrapper = new Style(styles, 'outer-wrapper')
      .addIf('wrapper-mode-fullscreen', inFullscreenMode)

    const editorText = new Style(styles, 'editor', 'editor-text', 'content-height')

    return (
      <div class={outerWrapper.getClasses()}>
        {showLinkModal && (
          <form
            class={styles['link-modal']}
            onSubmit={this.handleLinkSave.bind(this)}
          >
            <input
              class={styles['link-input']}
              onChange={this.handleLinkChange.bind(this)}
              placeholder="Link address"
              ref={el => this.linkInputElement = el}
              type="text"
              value={linkBeingEdited}
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

    selection.removeAllRanges()
    selection.addRange(range)    
  }

  handleEvent(callback, event) {
    if (typeof this.props[callback] === 'function') {
      this.props[callback].call(this, event)
    }
  }
}
