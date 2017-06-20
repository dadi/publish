const globals = require(`${__dirname}/../../../../app/globals`) // Always required
const regex = require(`${__dirname}/../../../../app/lib/helpers/regex`)

describe('Regex: URL', () => {
  it('should export object', () => {
    expect(regex.url).toBeInstanceOf(Object)
  })

  describe('URL test http', () => {
    const http = 'http://example.com'
    const match = regex.url.exec(http)
    
    it(`Should not return null for '${http}'`, () => {
      expect(match).not.toBeNull()
    })
    
    it(`Should have a first argument of '${http}'`, () => {
      expect(match[0]).toBe('http://example.com')
    })
    
    it(`Should have a first argument of 'http'`, () => {
      expect(match[1]).toBe('http')
    })
  })

  describe('URL test https', () => {
    const https = 'https://example.com'
    const match = regex.url.exec(https)
    
    it(`Should not return null for '${https}'`, () => {
      expect(match).not.toBeNull()
    })
    
    it(`Should have a first argument of '${https}'`, () => {
      expect(match[0]).toBe('https://example.com')
    })
    
    it(`Should have a first argument of 'https'`, () => {
      expect(match[1]).toBe('https')
    })
  })

  describe('URL test ftp', () => {
    const ftp = 'ftp://example.com'
    const match = regex.url.exec(ftp)
    
    it(`Should not return null for '${ftp}'`, () => {
      expect(match).not.toBeNull()
    })
    
    it(`Should have a first argument of '${ftp}'`, () => {
      expect(match[0]).toBe('ftp://example.com')
    })
    
    it(`Should have a first argument of 'ftp'`, () => {
      expect(match[1]).toBe('ftp')
    })
  })

  describe('URL test none passing string', () => {
    const foo = 'foo://example.com'
    const match = regex.url.exec(foo)
    
    it(`Should not return null for '${foo}'`, () => {
      expect(match).toBeNull()
    })
  })
})

