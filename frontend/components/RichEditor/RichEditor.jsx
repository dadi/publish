'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './RichEditor.css'
import stylesPell from './pell.css'

import pell from 'pell'
import showdown from 'showdown'

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
     * The format of the initial value.
     */
    inputFormat: proptypes.oneOf([
      'html',
      'markdown'
    ]),

    /**
     * A callback function that is fired whenever the content changes.
     * Called with the new value as a Markdown string.
     */
    onChangeMarkdown: proptypes.func
  }

  constructor(props) {
    super(props)

    this.state.html = null
  }

  handleChange(html) {
    const {onChangeMarkdown} = this.props
    const shouldRenderMarkdown = typeof onChangeMarkdown === 'function'

    let newState = {
      html
    }

    newState.markdown = shouldRenderMarkdown ?
      this.converter.makeMarkdown(html) :
      null

    console.log(html, this.converter.makeMarkdown(html))

    this.setState(newState)
  }

  componentDidMount() {
    const {children, inputFormat} = this.props

    this.converter = new showdown.Converter()

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
        {
          name: 'custom',
          icon: 'C',
          title: 'Custom Action',
          result: () => console.log('Do something!')
        },
        'italic'
      ],

      // classes<Array[string]> (optional)
      // Choose your custom class names
      classes: {
        actionbar: stylesPell['pell-actionbar'],
        button: stylesPell['pell-button'],
        content: stylesPell['pell-content'],
        selected: stylesPell['pell-button-selected']
      }
    })

    this.editor.content.innerHTML = inputFormat === 'html' ?
      children :
      this.converter.makeHtml(children)

  }  

  render() {
    const {children} = this.props

    return (
      <div>
        <div
          class={styles.editor}
          ref={el => this.editorElement = el}
        />

        <div>{this.state.html}</div>
        <div>{this.state.markdown}</div>
      </div>
    )
  }
}
