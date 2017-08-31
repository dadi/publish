const globals = require(`${__dirname}/../../../../../app/globals`) // Always required
const URLHelper = require(`${__dirname}/../../../../../frontend/lib/util/url-helper`).urlHelper

let urlHelper

beforeEach(() => {
  urlHelper = URLHelper()
})

describe('URLHelper', () => {
  it('should export object', () => {
    expect(URLHelper).toBeInstanceOf(Function)
  })

  describe('paramsToObject()', () => {
    it('should should return falsy if source is undefined', () => {
      expect(urlHelper.paramsToObject())
        .toBeFalsy()
    })

    it('should return falsy if source is incorrect prototype', () => {
      expect(urlHelper.paramsToObject({foo: 'bar'}))
        .toBeFalsy()
    })

    it('should convert valid parameters into an Object', () => {
      expect(urlHelper.paramsToObject('?filter={"title":{"$eq":"Foo%20Bar"}}'))
        .toEqual(expect.objectContaining({
          filter: expect.objectContaining({
            title: expect.objectContaining({
              $eq: "Foo Bar"
            })
          })
        }))
    })

    it('should parse string parameters', () => {
      expect(urlHelper.paramsToObject('?filter=foo'))
        .toEqual(expect.objectContaining({
          filter: 'foo'
        }))
    })
  })

  describe('paramsToString()', () => {
    it('should return falsy if params are undefined', () => {
      expect(urlHelper.paramsToString())
        .toBeFalsy()
    })

    it('should return falsy if params is incorrect prototype', () => {
      expect(urlHelper.paramsToString('incorrect'))
        .toBeFalsy()
    })

    it('should convert parameter object to url friendly param', () => {
      expect(urlHelper.paramsToString({foo: 'bar'}))
        .toBe('foo=bar')
    })

    it('should convert parameter object to url friendly param', () => {
      expect(urlHelper.paramsToString({foo: 'bar', baz: 'qux'}))
        .toBe('foo=bar&baz=qux')
    })

    it('should convert parameter object to readable param', () => {
      expect(urlHelper.paramsToString({foo: 'bar', baz: 'foo qux'}))
        .toBe('foo=bar&baz=foo qux')
    })
  })
})