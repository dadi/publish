import {h, options, render} from 'preact'
import {Router, route} from '@dadi/preact-router'
import {expect} from 'chai'
import {render as renderToString} from 'preact-render-to-string'
import htmlLooksLike from 'html-looks-like'

import MediaEdit from './MediaEdit'
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

const mockLocalMedia = {

}

const mockPaths = {
  create: [
    ':bucket[^[a-z-]]/new/:section?',
    ':group[^[a-z-]]/:bucket[^[a-z-]]/new/:section?'
  ],
  edit: [
    ':bucket[^[a-z-]]/:mediaId[^[a-fA-F0-9]{24}]/:section?',
    ':group[^[a-z-]]/:bucket[^[a-z-]]/:mediaId[^[a-fA-F0-9]{24}]/:section?'
  ],
  list: [
    ':bucket[^[a-z-]]/:page?[^\d+$]',
    ':group[^[a-z-]]/:bucket[^[a-z-]]/:page?[^\d+$]'
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
      buckets: [
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

const mockBucket = {
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
    media: {
      fieldsNotPersistedInLocalStorage: [],
      hasLoadedFromLocalStorage: false,
      local: null,
      peers: null,
      remote: null,
      remoteStatus: 'STATUS_IDLE',
      saveAttempts: 0,
      validationErrors: null
    },
    media: {
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
  scratch = media.createElement('div')
})

beforeEach(() => {
  media.body.appendChild(scratch)
  defaultState = getDefaultState() 
})

afterEach(() => {
  mount(null).remove()

  media.body.removeChild(media.body.firstChild)
})

describe('MediaEdit', () => {
  it('returns null if `bucket` prop is invalid', () => {

    const component = renderToString(
      <MockStore state={defaultState}>
          <MediaEdit />
      </MockStore>
    )

    expect(component).to.equal('')
  })

  it('returns null if `onGetRoutes` prop is invalid', () => {

    const component = renderToString(
      <MockStore state={defaultState}>
          <MediaEdit
            bucket={'articles'}
          />
      </MockStore>
    )

    expect(component).to.equal('')
  })

  describe('when editing a media', () => {
    it('renders an error message if media is not found', () => {
      defaultState.media.remoteError = 404
      defaultState.api.paths = mockPaths
      defaultState.api = mockApi

      const mockOnGetRoutes = jest.fn(() => {
        return {
          getCurrentBucket: () => { 
            return 'articles'
          }
        }
      })

      const component = renderToString(
        <MockStore state={defaultState}>
            <MediaEdit 
              bucket={'articles'}
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

    it('returns null if media is still loading', () => {
      defaultState.api.paths = mockPaths
      defaultState.api = mockApi
      defaultState.media.remoteStatus = 'STATUS_LOADING'

      const mockOnGetRoutes = jest.fn(() => {
        return {
          getCurrentBucket: () => { 
            return false
          }
        }
      })

      const component = renderToString(
        <MockStore state={defaultState}>
            <MediaEdit 
              bucket={'articles'}
              onGetRoutes={mockOnGetRoutes}
            />
        </MockStore>
      )


      expect(component).to.equal('')
    })

    it('returns null if media local state is falsy', () => {
      defaultState.api.paths = mockPaths
      defaultState.api = mockApi
      defaultState.media.remoteStatus = 'STATUS_IDLE'

      const mockOnGetRoutes = jest.fn(() => {
        return {
          getCurrentBucket: () => { 
            return false
          }
        }
      })

      const component = renderToString(
        <MockStore state={defaultState}>
            <MediaEdit 
              bucket={'articles'}
              onGetRoutes={mockOnGetRoutes}
            />
        </MockStore>
      )

      expect(component).to.equal('')
    })
  })
})