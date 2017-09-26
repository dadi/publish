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

let defaultState

const mockPaths = {
  create: [],
  edit: [],
  list: []
}

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
      status: 'STATUS_IDLE' },
    document: {
      fieldsNotPersistedInLocalStorage: [],
      loadedFromLocalStorage: false,
      local: null,
      peers: null,
      remote: null,
      remoteStatus: 'STATUS_IDLE',
      saveAttempts: 0,
      validationErrors: null
    },
    documents: {
      list: null,
      query: null,
      selected: [],
      status: 'STATUS_IDLE' 
    },
    router:{
      action: null,
      locationBeforeTransitions: null,
      params: {},
      room: null 
    },
    user: { 
      authEnabled: undefined,
      failedSignInAttempts: 0,
      hasSignedOut: false,
      remote: null,
      resetEmail: null,
      resetError: null,
      resetSuccess: false,
      status: 'STATUS_LOADED'
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

describe('App', () => {
  it('renders an error view if api paths are not defined', () => {
    const component = renderToString(
      <MockStore>
        <App />
      </MockStore>
    )

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

  it('renders an error view if api status is `STATUS_FAILED`', () => {
    defaultState.api.paths = mockPaths
    defaultState.user.status = 'STATUS_LOADED'
    defaultState.api.status = 'STATUS_FAILED'
    const component = renderToString(
      <MockStore state={defaultState}>
        <App />
      </MockStore>
    )

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

  it('renders an error view if route does not match', () => {
    defaultState.api.paths = mockPaths
    defaultState.api.status = 'STATUS_LOADED'
    const component = renderToString(
      <MockStore state={defaultState}>
        <App />
      </MockStore>
    )

    const error = renderToString(
      <MockStore>
        <ErrorView
          type={'ERROR_ROUTE_NOT_FOUND'}
        >
          {'{{ ... }}'}
        </ErrorView>
      </MockStore>
    )

    htmlLooksLike(component, error)
  })
})
