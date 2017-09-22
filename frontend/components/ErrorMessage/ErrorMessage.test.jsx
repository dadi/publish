import {h, options, render} from 'preact'
import {expect} from 'chai'

import * as Constants from 'lib/constants'

import Button from './../Button/Button'
import ErrorMessage from './ErrorMessage'
import HeroMessage from './../HeroMessage/HeroMessage'

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

describe('ErrorMessage component', () => {
  it('has propTypes', () => {
    const component = (
      <ErrorMessage />
    )

    expect(component.nodeName.propTypes).to.exist
    expect(Object.keys(component.nodeName.propTypes)).to.have.length.above(0)
  })

  it('renders an error message for ERROR_DOCUMENT_NOT_FOUND with a link for the given URL', () => {
    const output = (
      <ErrorMessage
        data={{href: 'foobar.com'}}
        type={Constants.ERROR_DOCUMENT_NOT_FOUND}
      />
    )

    expect(output).to.equal(
      <HeroMessage
        title="Oops!"
        subtitle="You're looking for a document that doesn't seem to exist."
      >
        <Button
          accent="system"
          href="foobar.com"
        >List documents</Button>
      </HeroMessage>
    )
  })

  it('renders an error message for ERROR_ROUTE_NOT_FOUND', () => {
    const output = (
      <ErrorMessage
        type={Constants.ERROR_ROUTE_NOT_FOUND}
      />
    )

    expect(output).to.equal(
      <HeroMessage
        title="404"
        subtitle="We couldn't find the page you're looking for, sorry."
      />
    )
  })

  it('renders an error message for STATUS_FAILED with a link for the given URL', () => {
    Object.defineProperty(window.location, "pathname", {
      writable: true,
      value: '/content/articles'
    })

    const output = (
      <ErrorMessage
        type={Constants.STATUS_FAILED}
      />
    )

    expect(output).to.equal(
      <HeroMessage
        title="API failure"
        subtitle="The API doesn't seem to be responding."
      >
        <Button
          accent="system"
          href="/content/articles"
        >Try again</Button>
      </HeroMessage>
    )
  })

  it('renders a generic error message when given an invalid or no error code', () => {
    const output = (
      <ErrorMessage
        type={Constants.ERROR_ROUTE_NOT_FOUND}
      />
    )

    expect(output).to.equal(
      <HeroMessage
        title="404"
        subtitle="We couldn't find the page you're looking for, sorry."
      />
    )
  })
})