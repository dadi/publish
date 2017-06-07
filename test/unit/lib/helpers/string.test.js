const globals = require(`${__dirname}/../../../../app/globals`) // Always required
const string = require(`${__dirname}/../../../../app/lib/helpers/string`)

describe('String', () => {
  it('should export object', () => {
    expect(string).toBeInstanceOf(Object)
  })

  describe('#Slugify()', () => {
    it('should return a string', () => {
      expect(string.Slugify('foo')).toBe('foo')
    })

    it('should return a slug', () => {
      expect(string.Slugify('foo bar !@£$%^&*( baz')).toBe('foo-bar-baz')
    })

    it('should handle undefined values', () => {
      expect(string.Slugify(undefined)).toBe('')
    })

    it('should convert properties to string', () => {
      expect(string.Slugify({})).toBe('object-object')
    })
  })

})

