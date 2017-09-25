import {h, options, render} from 'preact'
import {expect} from 'chai'

import DropArea from './DropArea'

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

describe('DropArea component', () => {
  it('has propTypes', () => {
    const component = (
      <DropArea />
    )

    expect(component.nodeName.propTypes).to.exist
    expect(Object.keys(component.nodeName.propTypes)).to.have.length.above(0)
  })

  it('renders a `<div>` node', () => {
    const component = (
      <DropArea />
    )

    mount(component)

    expect($('div.droparea').length).to.equal(1)
  })

  it('renders child nodes inside contents `<div>`', () => {
    const component = (
      <DropArea>
        <div class="child">foo</div>
      </DropArea>
    )

    mount(component)

    expect($('div.contents div.child').length).to.equal(1)
  })

  it('triggers `onDrop` callback after when `onDrop` event is fired and prop is defined', () => {
    const onDrop = jest.fn()
    let component

    mount(
      <DropArea
        onDrop={onDrop}
        ref={el => component = el}
      />
    )


    const drop = new Event('drop')

    $('div.droparea')[0].dispatchEvent(drop)

    expect(onDrop.mock.calls.length).to.equal(1)
    expect(onDrop.mock.calls[0][0]).to.deep.equal([])
  })

  it('does not trigger `onDrop` callback after when `onDrop` event is fired but `onDrop` prop is invalid', () => {
    const onDrop = jest.fn()
    let component

    mount(
      <DropArea
        onDrop={'foo'}
        ref={el => component = el}
      />
    )


    const drop = new Event('drop')

    $('div.droparea')[0].dispatchEvent(drop)

    expect(onDrop).not.to.have.been.called
  })

  it('sets `state.dragging` to true if drag event is `dragenter`', () => {
    let component

    mount(
      <DropArea
        ref={el => component = el}
      />
    )


    const drop = new Event('dragenter')

    $('div.droparea')[0].dispatchEvent(drop)

    expect(component.state.dragging).to.be.true
  })

  it('sets `state.dragging` to true if drag event is `dragover`', () => {
    let component

    mount(
      <DropArea
        ref={el => component = el}
      />
    )


    const drop = new Event('dragover')

    $('div.droparea')[0].dispatchEvent(drop)

    expect(component.state.dragging).to.be.true
  })

  it('sets `state.dragging` to false if drag event is `dragleave`', () => {
    let component

    mount(
      <DropArea
        ref={el => component = el}
      />
    )


    const drop = new Event('dragleave')

    $('div.droparea')[0].dispatchEvent(drop)

    expect(component.state.dragging).to.be.false
  })
})