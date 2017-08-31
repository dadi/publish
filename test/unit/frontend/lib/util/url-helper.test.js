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

  describe('paramsToObject', () => {
    it('should should return falsy if source is undefined', () => {
      expect(urlHelper.paramsToObject())
        .toBeFalsy()
    })

    it('should should return falsy if source is incorrect prototype', () => {
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
})