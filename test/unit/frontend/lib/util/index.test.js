const globals = require(`${__dirname}/../../../../../app/globals`) // Always required
const Util = require(`${__dirname}/../../../../../frontend/lib/util`)

beforeEach(() => {
  // Reset lastId
  // Util.lastId = 0   
})

describe('Util', () => {
  it('should export object', () => {
    expect(Util).toMatchObject(expect.any(Object))
  })

  describe('getUniqueId()', () => {
    it('should return a string containing a prefix and id', () => {
      expect(Util.getUniqueId())
        .toBe('c-0')
    })

    it('should return string containing incrememented id', () => {
      Util.getUniqueId()
      Util.getUniqueId()

      expect(Util.getUniqueId())
        .toBe('c-3')
    })
  })

  describe('objectToArray()', () => {
    it('should return an empty array if object is invalid', () => {
      expect(Util.objectToArray())
        .toEqual(expect.arrayContaining([]))
    })

    it('should return an empty array if keyField is invalid', () => {
      expect(Util.objectToArray({}))
        .toEqual(expect.arrayContaining([]))
    })

    it('should convert object key/values to array with specified key', () => {
      expect(Util.objectToArray({foo: 'bar', baz: 'qux'}, 'name'))
        .toEqual(expect.arrayContaining([
          expect.objectContaining({
            name: 'foo',
            value: 'bar'
          }),
          expect.objectContaining({
            name: 'baz',
            value: 'qux'
          })
        ]))
    })
  })

  describe('setPageTitle()', () => {
    it('should set document.title to be default title if title param is undefined', () => {
      Util.setPageTitle()

      expect(document.title)
        .toBe('DADI Publish')
    })

    it('should set document.title to be default title if title parameter is not a string', () => {
      Util.setPageTitle({})

      expect(document.title)
        .toBe('DADI Publish')
    })

    it('should return default document title if title parameter is not a string', () => {
      Util.setPageTitle('Foo')

      expect(document.title)
        .toBe('Foo / DADI Publish')
    })
  })
})

// connectHelper
// getUniqueId √
// objectToArray √
// arrayToObject
// isValidJSON
// isEmpty
// debounce
// throttle
// setPageTitle √