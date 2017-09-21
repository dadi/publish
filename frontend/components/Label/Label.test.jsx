import {h, options, render} from 'preact'
import {expect} from 'chai'

import Label from './Label'
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

describe('Label component', () => {
  it('has propTypes', () => {
    const component = (
      <Label />
    )

    expect(component.nodeName.propTypes).to.exist
    expect(Object.keys(component.nodeName.propTypes)).to.have.length.above(0)
  })

  it('should return `null` if required fields are invalid', () => {
    const componentWithNoParams = (
      <Label />
    )

    const componentWithInvalidLabel = (
      <Label 
        label={{}}
      />
    )

    mount(componentWithNoParams)

    expect(componentWithNoParams).to.equal(null)

    mount(componentWithInvalidLabel)

    expect(componentWithInvalidLabel).to.equal(null)
  })

  it('renders `<div>` with container class', () => {
    const component = (
      <Label 
        label={'foo'}
      />
    )

    mount(component)

    expect(component).not.to.equal(null)
    expect($('div.container').length).to.equal(1)
  })

  it('adds a comment class based on the `comment` prop', () => {
    const component = (
      <Label
        comment={'comment'}
        label={'foo'}
      />
    )

    mount(component)

    expect($('div.container-with-comment').length).to.equal(1)
  })

  it('adds a compact class based on the `compact` prop', () => {
    const component = (
      <Label
        compact={true}
        label={'foo'}
      />
    )

    mount(component)

    expect($('div.container-compact').length).to.equal(1)
  })

  it('adds an error class based on the `error` prop', () => {
    const component = (
      <Label
        error={true}
        label={'foo'}
      />
    )

    mount(component)

    expect($('div.container-error').length).to.equal(1)
  })

  it('adds an error message class based on the `errorMessage` prop', () => {
    const component = (
      <Label
        errorMessage={'foo'}
        label={'foo'}
      />
    )

    mount(component)

    expect($('div.container-error-message').length).to.equal(1)
  })

  it('adds a custom class based on the `className` prop', () => {
    const component = (
      <Label
        className={'container-custom-class'}
        label={'foo'}
      />
    )

    mount(component)

    expect($('div.container-custom-class').length).to.equal(1)
  })

  it('renders a `<sub>` node based on the `comment` prop', () => {
    const component = (
      <Label
        comment={'foo'}
        label={'foo'}
      />
    )

    mount(component)

    expect($('sub.comment').length).to.equal(1)
  })

  it('renders a `<p>` node based on the `errorMessage` prop', () => {
    const component = (
      <Label
        errorMessage={'foo'}
        label={'foo'}
      />
    )

    mount(component)

    expect($('p.error-message').length).to.equal(1)
  })

  it('assigns a unique id to each label instance', () => {
    const component1 = render(
      <Label
        label={'foo'}
      />
    )

    const component2 = render(
      <Label
        label={'bar'}
      />
    )
    expect(component1.children[0].getAttribute('for'))
      .not.to.equal(component2.children[0].getAttribute('for'))
  })

  it('adds an error attribute to children based on the `error` prop', () => {
    const component = render(
      <Label
        error={true}
        label={'bar'}
      >
        <div class="child"></div>
      </Label>
    )
    expect(component.children[0].getAttribute('error')).to.equal('true')
  })

  it('adds a required attribute to children based on the `required` prop', () => {
    const component = render(
      <Label
        required={true}
        label={'bar'}
      >
        <div class="child"></div>
      </Label>
    )
    expect(component.children[0].getAttribute('required')).to.equal('true')
  })

  it('should apply parent id attribute to all children', () => {
    const component = render(
      <Label
        label={'bar'}
      >
        <div class="child"></div>
      </Label>
    )
    expect(component.children[1].getAttribute('for'))
      .to.equal(component.children[0].getAttribute('id'))
  })
})