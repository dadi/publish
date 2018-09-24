'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './RichEditor.css'

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
     * A callback function that is fired whenever the content changes.
     * Called with the new value as a Markdown string.
     */
    onChangeMarkdown: proptypes.func,

    /**
     * The initial value of the editor.
     */
    value: proptypes.string,

    /**
     * The format of the initial value.
     */
    valueFormat: proptypes.oneOf([
      MODE.HTML,
      MODE.MARKDOWN
    ])    
  }

  constructor(props) {
    super(props)

    this.state.html = null
    this.state.mode = MODE.WYSIWYG
  }

  getHTMLFromMarkdown(markdown) {
    return snarkdown(markdown)
  }

  getMarkdownFromHTML(html) {
    return this.turndownService.turndown(html)
  }

  getNextMode() {
    const currentMode = this.state.mode

    let modes = Object.keys(MODE)
    let currentIndex = modes.findIndex(mode => {
      return currentMode === MODE[mode]
    })
    let nextIndex = (currentIndex + 1) % modes.length
    
    return MODE[modes[nextIndex]]
  }

  handleChange(value, initialRender) {
    const {onChangeMarkdown} = this.props
    const {mode} = this.state

    let html
    let markdown

    if (mode === MODE.MARKDOWN) {
      html = this.getHTMLFromMarkdown(value)
      markdown = value
    } else {
      html = value
      markdown = this.getMarkdownFromHTML(value)
    }

    this.setState({
      html,
      markdown
    })

    if (initialRender || (mode !== MODE.WYSIWYG)) {
      this.editor.content.innerHTML = html
    }

    if (!initialRender) {
      if (typeof onChangeMarkdown === 'function') {
        onChangeMarkdown(markdown)
      }

      if (typeof onChangeHTML === 'function') {
        onChangeHTML(html)
      }
    }
  }

  componentDidMount() {
    const {children, value, valueFormat} = this.props

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
        'heading1',
        'heading2',
        'quote',
        'olist',
        'ulist',
        'code',
        {
          name: 'mode',
          icon: 'Mode',
          title: 'Mode',
          result: () => this.setState({
            mode: this.getNextMode()
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

    let initialValue = valueFormat === MODE.MARKDOWN ?
      this.getHTMLFromMarkdown(value) :
      value

    this.handleChange(initialValue, true)
  }

  render() {
    const {children} = this.props
    const {html, markdown, mode} = this.state
    const wrapper = new Style(styles, 'wrapper', `wrapper-mode-${mode}`)
    const editorHTML = new Style(styles, 'editor', 'editor-html')
    const editorMarkdown = new Style(styles, 'editor', 'editor-markdown')

    return (
      <div>
        <div
          class={wrapper.getClasses()}
          ref={el => this.editorElement = el}
        />

        {(mode === MODE.MARKDOWN) && (
          <textarea
            class={editorMarkdown.getClasses()}
            onKeyUp={event => this.handleChange(event.target.value)}
            value={markdown}
          />
        )}

        {(mode === MODE.HTML) && (
          <textarea
            class={editorHTML.getClasses()}
            onKeyUp={event => this.handleChange(event.target.value)}
            value={html}
          />
        )}
      </div>
    )
  }
}
