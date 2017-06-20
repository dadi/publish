const globals = require(`${__dirname}/../../../../app/globals`) // Always required
const regex = require(`${__dirname}/../../../../app/lib/helpers/regex`)

describe('Regex: URL', () => {
  it('should export object', () => {
    expect(regex.url).toBeInstanceOf(Object)
  })

  describe('URL test http', () => {
    const http = 'http://example.com'
    const match = regex.url.exec(http)
    it (`Should not return null for '${http}'`, () => {
      expect(match).not.toBeNull()
    })
    it (`Should have a first argument of '${http}'`, () => {
      expect(match[0]).toBe('http://example.com')
    })
    it (`Should have a first argument of 'http'`, () => {
      expect(match[1]).toBe('http')
    })
  })
})

