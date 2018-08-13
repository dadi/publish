import {h, options, render} from 'preact'
import {Router, route} from '@dadi/preact-router'
import {expect} from 'chai'
import {render as renderToString} from 'preact-render-to-string'
import htmlLooksLike from 'html-looks-like'

import DocumentEdit from './DocumentEdit'
import MockStore from './MockStore'

import ErrorMessage from 'components/ErrorMessage/ErrorMessage'

// DOM setup
let $, mount, root, scratch

options.debounceRendering = f => f()

let defaultState

Object.defineProperty(window.location, "pathname", {
  writable: true,
  value: '/'
})

const mockLocalDocument = {

}

const mockPaths = {
  create: [
    ':collection[^[a-z-]]/new/:section?',
    ':group[^[a-z-]]/:collection[^[a-z-]]/new/:section?'
  ],
  edit: [
    ':collection[^[a-z-]]/:documentId[^[a-fA-F0-9]{24}]/:section?',
    ':group[^[a-z-]]/:collection[^[a-z-]]/:documentId[^[a-fA-F0-9]{24}]/:section?'
  ],
  list: [
    ':collection[^[a-z-]]/:page?[^\d+$]',
    ':group[^[a-z-]]/:collection[^[a-z-]]/:page?[^\d+$]'
  ]
}

const mockApi = {
  apis: [
    {
      database: 'test',
      name: 'Publish Test API',
      port: 80,
      publishId: 'foo',
      version: '1.0',
      collections: [
        {
          database: 'test',
          name: "Articles",
          slug: 'articles',
          version: '1.0'
        }
      ]
    }
  ]
}

const mockCollection = {
  database: 'test',
  name: "Articles",
  slug: 'articles',
  version: '1.0'
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
      status: 'STATUS_IDLE' 
    },
    document: {
      fieldsNotPersistedInLocalStorage: [],
      hasLoadedFromLocalStorage: false,
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

describe('DocumentEdit', () => {
  it('returns null if `collection` prop is invalid', () => {

    const component = renderToString(
      <MockStore state={defaultState}>
          <DocumentEdit />
      </MockStore>
    )

    expect(component).to.equal('')
  })

  it('returns null if `onGetRoutes` prop is invalid', () => {

    const component = renderToString(
      <MockStore state={defaultState}>
          <DocumentEdit
            collection={'articles'}
          />
      </MockStore>
    )

    expect(component).to.equal('')
  })

  describe('when editing a document', () => {
    it('renders an error message if document is not found', () => {
      defaultState.document.remoteStatus = 'STATUS_NOT_FOUND'
      defaultState.api.paths = mockPaths
      defaultState.api = mockApi

      const mockOnGetRoutes = jest.fn(() => {
        return {
          getCurrentCollection: () => { 
            return 'articles'
          }
        }
      })

      const component = renderToString(
        <MockStore state={defaultState}>
            <DocumentEdit 
              collection={'articles'}
              onGetRoutes={mockOnGetRoutes}
            />
        </MockStore>
      )

      const error = renderToString(
        <ErrorMessage
          data={{href: '/articles'}}
          type={'ERROR_DOCUMENT_NOT_FOUND'}
        />
      )

      expect(component).to.equal(error)
    })

    it('returns null if document is still loading', () => {
      defaultState.api.paths = mockPaths
      defaultState.api = mockApi
      defaultState.document.remoteStatus = 'STATUS_LOADING'

      const mockOnGetRoutes = jest.fn(() => {
        return {
          getCurrentCollection: () => { 
            return false
          }
        }
      })

      const component = renderToString(
        <MockStore state={defaultState}>
            <DocumentEdit 
              collection={'articles'}
              onGetRoutes={mockOnGetRoutes}
            />
        </MockStore>
      )


      expect(component).to.equal('')
    })

    it('returns null if document local state is falsy', () => {
      defaultState.api.paths = mockPaths
      defaultState.api = mockApi
      defaultState.document.remoteStatus = 'STATUS_IDLE'

      const mockOnGetRoutes = jest.fn(() => {
        return {
          getCurrentCollection: () => { 
            return false
          }
        }
      })

      const component = renderToString(
        <MockStore state={defaultState}>
            <DocumentEdit 
              collection={'articles'}
              onGetRoutes={mockOnGetRoutes}
            />
        </MockStore>
      )

      expect(component).to.equal('')
    })
  })

  describe('when creating a new document', () => {
    it('renders a container ', () => {
      defaultState.api.paths = mockPaths
      defaultState.api = mockApi
      defaultState.document.remoteStatus = 'STATUS_IDLE'
      defaultState.document.local = mockLocalDocument

      const mockOnGetRoutes = jest.fn(() => {
        return {
          getCurrentCollection: () => { 
            return {
              name: 'articles',
              fields: {
                foo: {
                  type: 'String',
                  publish: {
                    
                  }
                }
              }
            }
          }
        }
      })

      const component = (
        <MockStore state={defaultState}>
            <DocumentEdit 
              collection={'articles'}
              onGetRoutes={mockOnGetRoutes}
            />
        </MockStore>
      )


      const container = (
        <div class="container">(...)</div>
      )

      expect(component).to.matchTemplate(container)
    })
  })
})