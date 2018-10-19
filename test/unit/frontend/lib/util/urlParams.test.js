const globals = require(`${__dirname}/../../../../../app/globals`) // Always required
const URLParams = require(`${__dirname}/../../../../../frontend/lib/util/urlParams`).URLParams

describe('URLParams', () => {
  describe('toObject()', () => {
    it('should should return falsy if source is undefined', () => {
      expect(new URLParams().toObject())
        .toBeFalsy()
    })

    it('should return falsy if source is incorrect prototype', () => {
      expect(new URLParams({foo: 'bar'}).toObject())
        .toBeFalsy()
    })

    it('should convert valid parameters into an Object', () => {
      expect(new URLParams('?filter={"title":{"$eq":"Foo%20Bar"}}').toObject())
        .toEqual(expect.objectContaining({
          filter: expect.objectContaining({
            title: expect.objectContaining({
              $eq: 'Foo Bar'
            })
          })
        }))
    })

    it('should parse string parameters', () => {
      expect(new URLParams('?filter=foo').toObject())
        .toEqual(expect.objectContaining({
          filter: 'foo'
        }))
    })
  })

  describe('toString()', () => {
    it('should return falsy if params are undefined', () => {
      expect(new URLParams().toString())
        .toBeFalsy()
    })

    it('should return falsy if params is incorrect prototype', () => {
      expect(new URLParams('incorrect').toString())
        .toBeFalsy()
    })

    it('should convert parameter object to url friendly param', () => {
      expect(new URLParams({foo: 'bar'}).toString())
        .toBe('foo=bar')
    })

    it('should convert parameter object to url friendly param', () => {
      expect(new URLParams({foo: 'bar', baz: 'qux'}).toString())
        .toBe('foo=bar&baz=qux')
    })

    it('should convert parameter object to readable param', () => {
      expect(new URLParams({foo: 'bar', baz: 'foo qux'}).toString())
        .toBe('foo=bar&baz=foo qux')
    })
  })
})