import {h, options, render} from 'preact'
import {expect} from 'chai'

import Paginator from './Paginator'
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

describe('Paginator component', () => {
  it('has propTypes', () => {
    const component = (
      <Paginator />
    )

    expect(component.nodeName.propTypes).to.exist
    expect(Object.keys(component.nodeName.propTypes)).to.have.length.above(0)
  })

  it('should return `null` if required fields are not defined', () => {
    const componentWithNoParams = (
      <Paginator />
    )

    mount(componentWithNoParams)

    expect(componentWithNoParams).to.equal(null)
  })

  it('should return `null` if there are no pages to render', () => {
    const component = (
      <Paginator
        currentPage={0}
        totalPages={0}
        maxPages={0}
      />
    )

    mount(component)

    expect(component).to.equal(null)
  })

  it('limits the number of `<button>` nodes rendered to the `maxPages` parameter', () => {
    const maxPages = 4
    const mockCallback = jest.fn()

    const component = (
      <Paginator
        currentPage={1}
        totalPages={20}
        maxPages={maxPages}
        linkCallback={mockCallback}
      />
    )
    mount(component)

    expect($('.page').length).to.equal(maxPages + 1)
  })

  it('should call `linkCallback()` method to render each page href value', () => {
    const maxPages = 4
    const prevPage = 0
    const nextPage = 2
    const currentPage = 1
    const expectedPages = [1, 2, 3, 4, prevPage, nextPage]
    const mockCallback = jest.fn((page) => {
      return `/foo/bar/${page}`
    })

    const component = (
      <Paginator
        currentPage={currentPage}
        totalPages={20}
        maxPages={maxPages}
        linkCallback={mockCallback}
      />
    )
    mount(component)

    expect($('.page').length).to.equal(maxPages + 1)
    expect(mockCallback.mock.calls.length).to.equal(expectedPages.length)
  })

  it('should not render a next button if the currentPage is equal to the total pages', () => {
    const maxPages = 4
    const mockCallback = jest.fn()

    const component = (
      <Paginator
        currentPage={20}
        totalPages={20}
        maxPages={maxPages}
        linkCallback={mockCallback}
      />
    )
    mount(component)

    const prevNext = $('a.page-secondary')
    expect(prevNext.length).to.equal(1)
  })

  it('should not render a prev button if the currentPage is equal to the total pages', () => {
    const maxPages = 4
    const mockCallback = jest.fn()

    const component = (
      <Paginator
        currentPage={1}
        totalPages={20}
        maxPages={maxPages}
        linkCallback={mockCallback}
      />
    )
    mount(component)

    const prevNext = $('a.page-secondary')
    expect(prevNext.length).to.equal(1)
  })

  it('renders a mock button for the current selected', () => {
    const maxPages = 4
    const currentPage = 5
    const mockCallback = jest.fn()

    const component = (
      <Paginator
        currentPage={currentPage}
        totalPages={20}
        maxPages={maxPages}
        linkCallback={mockCallback}
      />
    )
    mount(component)

    const paginators = $('.page')
    expect(paginators[1].__n).to.equal('span')
  })
})
