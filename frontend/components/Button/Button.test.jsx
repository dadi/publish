import {h} from 'preact'
import render from 'preact-render-to-string'
import htmlLooksLike from 'html-looks-like'

import Button from './Button'

describe('Button', () => {
  it('renders as a `<a>` element when given a `href` prop', () => {
    const actual = render(
      <Button
        accent="neutral"
        href="/foobar"
      >Click me</Button>
    )
    const expected = `
      <a href="/foobar" class="button button-neutral">Click me</a>
    `

    htmlLooksLike(actual, expected)
  })

  it('renders as a `<label>` element when given a `forId` prop', () => {
    const actual = render(
      <Button
        accent="neutral"
        forId="otherelement1"
      >Click me</Button>
    )
    const expected = `
      <label class="button button-neutral" for="otherelement1">Click me</label>
    `

    htmlLooksLike(actual, expected)
  })

  it('renders as a `<span>` element when the prop `type` is `mock`', () => {
    const actual = render(
      <Button
        accent="neutral"
        type="mock"
      >Do not click me</Button>
    )
    const expected = `
      <span class="button button-neutral button-mock">Do not click me</span>
    `

    htmlLooksLike(actual, expected)
  })

  it('renders as a `<button>` element by default', () => {
    const actual = render(
      <Button
        accent="neutral"
      >Click me</Button>
    )
    const expected = `
      <button class="button button-neutral">Click me</button>
    `

    htmlLooksLike(actual, expected)
  })

  it('adds a `onClick` attribute when given the `onClick` prop', () => {
    const actual = render(
      <Button
        accent="neutral"
        onClick="doSomething()"
      >Click me</Button>
    )
    const expected = `
      <button class="button button-neutral" onClick="doSomething()">Click me</button>
    `

    htmlLooksLike(actual, expected)
  })

  it('adds a `disabled` attribute when given the `disabled` prop', () => {
    const actual = render(
      <Button
        accent="neutral"
        disabled={true}
      >I am disabled</Button>
    )
    const expected = `
      <button class="button button-neutral" disabled>I am disabled</button>
    `

    htmlLooksLike(actual, expected)
  })

  it('defaults to the `neutral` accent', () => {
    const actual = render(
      <Button>Click me</Button>
    )
    const expected = `
      <button class="button button-neutral">Click me</button>
    `

    htmlLooksLike(actual, expected)
  })

  it('adds an accent class based on the `accent` prop', () => {
    const actual = render(
      <Button
        accent="system"
      >Click me</Button>
    )
    const expected = `
      <button class="button button-system">Click me</button>
    `

    htmlLooksLike(actual, expected)
  })

  it('adds a group position class based on the `inGroup` prop', () => {
    const actual = render(
      <Button
        accent="neutral"
        inGroup="left"
      >Click me</Button>
    )
    const expected = `
      <button class="button button-neutral button-in-group-left">Click me</button>
    `

    htmlLooksLike(actual, expected)
  })

  it('adds a size class based on the `size` prop', () => {
    const actual = render(
      <Button
        accent="neutral"
        size="small"
      >Click me</Button>
    )
    const expected = `
      <button class="button button-neutral button-small">Click me</button>
    `

    htmlLooksLike(actual, expected)
  })

  it('accepts additional class names via the `className` prop', () => {
    const actual = render(
      <Button
        accent="neutral"
        className="class-one class-two"
      >Click me</Button>
    )
    const expected = `
      <button class="button button-neutral class-one class-two">Click me</button>
    `

    htmlLooksLike(actual, expected)
  })
})
