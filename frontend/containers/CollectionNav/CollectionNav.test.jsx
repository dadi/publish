import {h, options, render} from 'preact'
import {Router, route} from 'preact-router-regex'
import {expect} from 'chai'
import {render as renderToString} from 'preact-render-to-string'
import htmlLooksLike from 'html-looks-like'

import CollectionNav from './CollectionNav'
import MockStore from './MockStore'

import Nav from 'components/Nav/Nav'

// DOM setup
let $, mount, root, scratch

options.debounceRendering = f => f()

let defaultState

Object.defineProperty(window.location, "pathname", {
  writable: true,
  value: '/'
})

const mockGroups = [{id: 'articles', label: 'Articles', href: '/articles'}]

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
          database: 'foo',
          name: "Articles",
          slug: 'articles',
          version: '1.0'
        }
      ]
    }
  ]
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
    router: {
      action: "POP",
      locationBeforeTransitions: {
        pathname: "/",
        search: "",
        hash: "",
        state: undefined
      },
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

  it('generates `groups` prop from api state collections', () => {
    let component

    defaultState.api = mockApi

    mount(
      <MockStore state={defaultState}>
        <CollectionNav 
          ref={c => component = c}
        />
      </MockStore>
    )

    component.forceUpdate()

    // Mock Nav for comparison
    // const nav = renderToString(
    //   <MockStore>
    //     <Nav
    //       currentRoute={'/'}
    //       items={mockGroups}
    //       mobile={false}
    //     >
    //       {'{{ ... }}'}
    //     </Nav>
    //   </MockStore>
    // )

    expect(component._component.groups).to.deep.equal(mockGroups)
  })
})
