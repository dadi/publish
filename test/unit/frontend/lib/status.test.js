const globals = require(`${__dirname}/../../../../app/globals`) // Always required
const Status = require(`${__dirname}/../../../../frontend/lib/status`)

Object.defineProperty(window.navigator, "onLine", ((_value) => {
  return {
    get: () => {
      return _value
    },
    set: (v) => {
        _value = v
    }
  }
})(window.navigator.onLine))

beforeEach(() => {
  window.navigator.onLine = true
})

describe('Status', () => {
  it('should be an Object', () => {
    expect(Status).toMatchObject(expect.any(Object))
  })

  describe('isOnline()', () => {
    it('should return true if window.navigator.onLine is true', () => {
      expect(Status.isOnline()).toBeTruthy()
    })

    it('should return true if window.navigator.onLine is false but is defined', () => {
      window.navigator.onLine = false
      expect(Status.isOnline()).toBeTruthy()
    })

    it('should return false if window.navigator.onLine is undefined', () => {
      window.navigator.onLine = undefined
      expect(Status.isOnline()).toBeFalsy()
    })
  })
})
