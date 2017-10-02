import {h, options, render} from 'preact'
import {Router, route} from 'preact-router-regex'
import {expect} from 'chai'
import {render as renderToString} from 'preact-render-to-string'
import htmlLooksLike from 'html-looks-like'

import CollectionNav from './CollectionNav'
import MockStore from './MockStore'

// DOM setup
let $, mount, root, scratch

options.debounceRendering = f => f()

let defaultState

Object.defineProperty(window.location, "pathname", {
  writable: true,
  value: '/'
})

const getDefaultState = () => {
  return { 
    api: {
      apis: [],
      paths: undefined,
      status: 'STATUS_IDLE'
    },
    app: {
      breakpoint: 'medium',
      config: null,
      networkStatus: 'NETWORK_OK',
      notification: null,
      status: 'STATUS_IDLE' 
    },
    router:{
      action: null,
      locationBeforeTransitions: null,
      params: {},
      room: null 
    }
  }
}

beforeAll(() => {
  $ = sel => scratch.querySelectorAll(sel)
  mount = jsx => root = render(jsx, scratch, root)
  scratch = document.createElement('div')
})

beforeEach(() => {
  document.body.appendChild(scratch)
  defaultState = getDefaultState() 
})

afterEach(() => {
  mount(null).remove()

  document.body.removeChild(document.body.firstChild)
})

describe('CollectionNav', () => {
  it('returns null if apis are not defined', () => {
    const component = renderToString(
      <MockStore state={defaultState}>
          <CollectionNav />
      </MockStore>
    )

    expect(component).to.equal('')
  })
})
