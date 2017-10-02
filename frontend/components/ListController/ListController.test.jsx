import {h, options, render} from 'preact'
import {expect} from 'chai'

import ListController from './ListController'

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

describe('ListController component', () => {
  it('has propTypes', () => {
    const component = (<ListController />)

    expect(component.nodeName.propTypes).to.exist
    expect(Object.keys(component.nodeName.propTypes)).to.have.length.above(0)
  })

  it('returns null if `children` prop is empty', () => {
    const component = (<ListController />)

    mount(component)

    expect(component).to.equal(null)
  })

  it('returns `<div>` if `children` prop contains one or more nodes', () => {
    const component = (
      <ListController>
        <div>foo</div>
      </ListController>
    )

    mount(component)

    expect(component).not.to.equal(null)
  })
})
