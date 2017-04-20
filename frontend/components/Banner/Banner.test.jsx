import {h} from 'preact'
import {expect} from 'chai'

import Banner from './Banner'

describe('Banner component', () => {
  it('has propTypes', () => {
    const banner = (
      <Banner>Some message</Banner>      
    )

    expect(banner.nodeName.propTypes).to.exist
    expect(Object.keys(banner.nodeName.propTypes)).to.have.length.above(0)
  })

  it('renders as a `<p>` element with the given children and default accent', () => {
    const banner = (
      <Banner>Some message</Banner>      
    )
    const defaultAccent = banner.nodeName.defaultProps.accent
    
    expect(banner).to.contain(
      <p class={`banner banner-${defaultAccent}`}>Some message</p>
    )
  })

  it('defaults to the `error` accent', () => {
    const banner = (
      <Banner>Some message</Banner>      
    )
    
    expect(banner).to.contain(
      <p class="banner banner-error">Some message</p>
    )
  })
})
