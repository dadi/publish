'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './RichEditor.css'

import Button from 'components/Button/Button'
import pell from 'pell'
import snarkdown from 'snarkdown'
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
     * A callback function that is fired whenever the content changes.
     */
    onChange: proptypes.func,

    /**
     * The initial value of the editor.
     */
    value: proptypes.string
  }

  constructor(props) {
    super(props)

    this.state.html = null
    this.state.inTextMode = false
    this.state.linkBeingEdited = null
    this.state.selection = null
    this.state.showLinkModal = false
    this.state.text = null
  }

  componentDidMount() {
    const {children, format, value} = this.props

    this.turndownService = new TurndownService()

    // Initialize pell on an HTMLElement
    this.editor = pell.init({
      // <HTMLElement>, required
      element: this.editorElement,

      // <Function>, required
      // Use the output html, triggered by element's `oninput` event
      onChange: this.handleChange.bind(this),

      // <string>, optional, default = 'div'
      // Instructs the editor which element to inject via the return key
      defaultParagraphSeparator: 'div',

      // <boolean>, optional, default = false
      // Outputs <span style="font-weight: bold;"></span> instead of <b></b>
      styleWithCSS: false,

      // <Array[string | Object]>, string if overwriting, object if customizing/creating
      // action.name<string> (only required if overwriting)
      // action.icon<string> (optional if overwriting, required if custom action)
      // action.title<string> (optional)
      // action.result<Function> (required)
      // Specify the actions you specifically want (in order)
      actions: [
        'bold',
        'italic',
        {
          name: 'link',
          result: () => this.setState({
            showLinkModal: true
          })
        },
        'heading1',
        'heading2',
        'quote',
        'olist',
        'ulist',
        'code',
        {
          icon: `<span class="${styles['text-mode-toggle']}">Text</span>`,
          title: 'Text',
          result: () => this.setState({
            inTextMode: !this.state.inTextMode
          })
        }
      ],

      // classes<Array[string]> (optional)
      // Choose your custom class names
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

    this.handleChange(initialValue, true)

    this.editorElement.addEventListener('click', this.handleClick.bind(this))
  }

  componentDidUpdate(prevProps, prevState) {
    const {showLinkModal} = this.state

    if (showLinkModal && !prevState.showLinkModal) {
      console.log('---> Saving selection')
      this.setState({
        selection: window.getSelection().getRangeAt(0)
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
    return snarkdown(markdown)
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

  handleChange(value, initialRender) {
    const {format, onChange} = this.props
    const {inTextMode} = this.state

    let html
    let text

    console.log('!!! CHANGE')

    if (inTextMode) {
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

    if (initialRender || inTextMode) {
      this.editor.content.innerHTML = html
    }

    if (!initialRender && (typeof onChange === 'function')) {
      onChange(text)
    }
  }

  handleClick(event) {
    const {linkBeingEdited} = this.state
    const {target} = event

    if (target.tagName !== 'A') {
      // this.closeLinkModal()

      return
    }

    let href = target.attributes.href.value
    let range = document.createRange()

    range.setStart(target, 0)
    range.setEnd(target, 1)    

    this.setSelection(range)

    this.setState({
      linkBeingEdited: href,
      linkRange: range
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

    this.closeLinkModal()
  }

  handleLinkSave() {
    const {selection} = this.state

    if (selection) {
      this.setSelection(selection)  
    }

    pell.exec('createLink', this.state.linkBeingEdited)
  }

  render() {
    const {children} = this.props
    const {
      html,
      inTextMode,
      linkBeingEdited,
      showLinkModal,
      text
    } = this.state
    const wrapper = new Style(styles, 'wrapper')
      .addIf('wrapper-mode-text', inTextMode)
    const editorText = new Style(styles, 'editor', 'editor-text')

    return (
      <div class={styles['outer-wrapper']}>
        <div
          class={wrapper.getClasses()}
          ref={el => this.editorElement = el}
        />

        {inTextMode && (
          <textarea
            class={editorText.getClasses()}
            onKeyUp={event => this.handleChange(event.target.value)}
            value={text}
          />
        )}

        {showLinkModal && (
          <div class={styles['link-modal']}>
            <span class={styles['link-label']}>Link:</span>

            <input
              class={styles['link-input']}
              onChange={this.handleLinkChange.bind(this)}              
              type="text"
              value={linkBeingEdited}
            />

            <Button
              accent="save"
              className={styles['link-control']}
              onClick={this.handleLinkSave.bind(this)}
            >Save</Button>

            <Button
              accent="destruct"
              className={styles['link-control']}
              onClick={this.handleLinkRemove.bind(this)}
            >Remove</Button>
          </div>
        )}
      </div>
    )
  }

  setSelection(range) {
    let selection = window.getSelection()

    selection.removeAllRanges()
    selection.addRange(range)    
  }
}
