import {h, options, render} from 'preact'
import {expect} from 'chai'
import {render as renderToString} from 'preact-render-to-string'
import htmlLooksLike from 'html-looks-like'

import ErrorView from 'views/ErrorView/ErrorView'
import App from './App'
import MockStore from './MockStore'

// DOM setup
let $, mount, root, scratch

options.debounceRendering = f => f()

beforeAll(() => {
  $ = sel => scratch.querySelectorAll(sel)
  mount = jsx => root = render(jsx, scratch, root)
  scratch = document.createElement('div')
})

beforeEach(() => {
  document.body.appendChild(scratch)
})

afterEach(() => {
  mount(null).remove()

  document.body.removeChild(document.body.firstChild)
})

describe('App', () => {
  it('renders an error view if api paths are not defined', () => {
    const component = renderToString(
      <MockStore>
        <App />
      </MockStore>
    )

    // mount(component)

    const error = renderToString(
      <MockStore>
        <ErrorView
          type={'STATUS_FAILED'}
        >
          {'{{ ... }}'}
        </ErrorView>
      </MockStore>
    )

    htmlLooksLike(component, error)
  })
})
