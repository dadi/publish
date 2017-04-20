import {h} from 'preact'
import {expect} from 'chai'

import Button from './Button'

describe('Button component', () => {
  it('renders as a `<a>` element when given a `href` prop', () => {
    const button = (
      <Button
        accent="neutral"
        href="/foobar"
      >Click me</Button>      
    )
    
    expect(button).to.contain(
      <a href="/foobar" class="button button-neutral">Click me</a>
    )
  })

  it('renders as a `<label>` element when given a `forId` prop', () => {
    const button = (
      <Button
        accent="neutral"
        forId="otherelement1"
      >Click me</Button>
    )
    
    expect(button).to.contain(
      <label class="button button-neutral" for="otherelement1">Click me</label>
    )
  })

  it('renders as a `<span>` element when the prop `type` is `mock`', () => {
    const button = (
      <Button
        accent="neutral"
        type="mock"
      >Do not click me</Button>
    )
    
    expect(button).to.contain(
      <span class="button button-neutral button-mock">Do not click me</span>
    )
  })

  it('renders as a `<button>` element by default', () => {
    const button = (
      <Button
        accent="neutral"
      >Click me</Button>
    )
    
    expect(button).to.contain(
      <button class="button button-neutral" type="button">Click me</button>
    )
  })

  it('adds a `onClick` attribute when given the `onClick` prop', () => {
    const button = (
      <Button
        accent="neutral"
        onClick="doSomething()"
      >Click me</Button>
    )
    
    expect(button).to.contain(
      <button class="button button-neutral" type="button" onClick="doSomething()">Click me</button>
    )
  })

  it('adds a `disabled` attribute when given the `disabled` prop', () => {
    const button = (
      <Button
        accent="neutral"
        disabled={true}
      >I am disabled</Button>
    )
    
    expect(button).to.contain(
      <button class="button button-neutral" type="button" disabled>I am disabled</button>
    )
  })

  it('defaults to the `neutral` accent', () => {
    const button = (
      <Button>Click me</Button>
    )
    
    expect(button).to.contain(
      <button class="button button-neutral" type="button">Click me</button>
    )
  })

  it('adds an accent class based on the `accent` prop', () => {
    const button = (
      <Button
        accent="system"
      >Click me</Button>
    )
    
    expect(button).to.contain(
      <button class="button button-system" type="button">Click me</button>
    )
  })

  it('adds a group position class based on the `inGroup` prop', () => {
    const button = (
      <Button
        accent="neutral"
        inGroup="left"
      >Click me</Button>
    )
    
    expect(button).to.contain(
      <button class="button button-neutral button-in-group-left" type="button">Click me</button>
    )
  })

  it('adds a size class based on the `size` prop', () => {
    const button = (
      <Button
        accent="neutral"
        size="small"
      >Click me</Button>
    )
    
    expect(button).to.contain(
      <button class="button button-neutral button-small" type="button">Click me</button>
    )
  })

  it('accepts additional class names via the `className` prop', () => {
    const button = (
      <Button
        accent="neutral"
        className="class-one class-two"
      >Click me</Button>
    )
    
    expect(button).to.contain(
      <button class="button button-neutral class-one class-two" type="button">Click me</button>
    )
  })  
})
