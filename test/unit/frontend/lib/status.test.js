const globals = require(`${__dirname}/../../../../app/globals`) // Always required
const Status = require(`${__dirname}/../../../../frontend/lib/status`)

const nock = require('nock')

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

  describe('isServerOnline()', () => {
    it('should return false when fetch rejects', () => {
      expect.assertions(1)
      return expect(Status.isServerOnline()).resolves.toBeFalsy()
    })

    it('should return true when fetch to domain route returns 200 status', () => {
      expect.assertions(1)
      window.fetch = jest.fn().mockImplementation(() => Promise.resolve({
        status: 200
      }))
      return expect(Status.isServerOnline()).resolves.toBeTruthy()
    })

    it('should return false when fetch to domain route does not return 200 status', () => {
      expect.assertions(1)
      window.fetch = jest.fn().mockImplementation(() => Promise.resolve({
        status: 500
      }))
      return expect(Status.isServerOnline()).resolves.toBeFalsy()
    })
  })
})
