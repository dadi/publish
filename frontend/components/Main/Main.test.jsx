import {h, options, render} from 'preact'
import {expect} from 'chai'

// Mock state
import {Provider} from 'preact-redux'
import {
  applyMiddleware,
  combineReducers,
  compose,
  createStore
} from 'redux'
import thunk from 'redux-thunk'

const storeComposer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const store = storeComposer(applyMiddleware(thunk))(createStore)(() => {
  return {
    app: {
      api: () => {}
    }
  }
})

import Main from './Main'

// DOM setup
let $, mount, root, scratch

options.debounceRendering = f => f()

beforeAll(() => {
  $ = sel => scratch.querySelectorAll(sel)
  mount = jsx => root = render(jsx, scratch, root)
  scratch = document.createElement('div')
})

afterEach(() => {
  mount(null).remove()
})

afterEach(() => {
  mount(null).remove()
})

describe('Main component', () => {
  it('should apply a background to the document body with random svg', () => {
    const component = (
      <Provider store={store}>
        <Main />
      </Provider>
    )

    mount(component)

    expect(document.body.style.backgroundImage).to.match(/url\(\/public\/images\/bg_[1-3].svg\)/)
  })

  it('should render a `<main>` component with class `main`', () => {
    const component = (
      <Provider store={store}>
        <Main />
      </Provider>
    )

    mount(component)

    expect($('main.main').length).to.equal(1)
  })

  it('should render a `LoadingBar` container inside `<main>`', () => {
    const component = (
      <Provider store={store}>
        <Main />
      </Provider>
    )

    mount(component)

    expect($('div.bar').length).to.equal(1)
  })
})
