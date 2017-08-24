const globals = require(`${__dirname}/../../../app/globals`).Globals // Always required

describe('Globals', () => {
  it('should export object', () => {
    expect(globals).toBeInstanceOf(Object)
  })

  describe('set', () => {
    it('should throw an error if newParams is invalid', () => {
      const set = () => {
        return globals.set(undefined)
      }

      expect(set).toThrowError('Paths must be an Object.')
    })

    it('should assign new parameters to global.paths', () => {
      globals.set({foo: 'bar'})

      expect(global.paths.foo)
        .toBe('bar')
    })
  })
})

