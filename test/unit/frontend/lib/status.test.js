const globals = require(`${__dirname}/../../../../app/globals`) // Always required
const Status = require(`${__dirname}/../../../../frontend/lib/status`)

let connectionMonitor
const mockStatusChangeCallback = jest.fn()

jest.useFakeTimers()

Object.defineProperty(window.navigator, 'onLine', ((_value) => {
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
  connectionMonitor = new Status.default

  mockStatusChangeCallback.mockReset()
})

afterEach(() => {
  jest.clearAllTimers()
  setInterval.mockClear()
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

  describe('Class ConnectionMonitor', () => {
    it('should be an Object', () => {
      expect(connectionMonitor).toMatchObject(expect.any(Object))
    })

    describe('watch()', () => {
      it('should set variable monitor to be a setInterval function', () => {
        connectionMonitor.watch(1000)

        expect(connectionMonitor.monitor)
          .not.toBeUndefined()
      })

      it('should set variable monitor to be a setInterval function', () => {
        connectionMonitor.watch(1000)

        expect(setInterval.mock.calls.length).toBe(1)
        expect(setInterval.mock.calls[0][1]).toBe(1000)
      })
    })

    describe('status', () => {
      it('should store status as statusCode', () => {
        connectionMonitor.status = 200
        expect(connectionMonitor.statusCode).toBe(200)
      })

      it('should send status to callback method if callback method is defined', () => {
        connectionMonitor.status = 200
        connectionMonitor.registerStatusChangeCallback(mockStatusChangeCallback)
        connectionMonitor.status = 500

        expect(mockStatusChangeCallback).toHaveBeenCalledWith(500)
      })

      it('should not send status to callback method if callback method undefined', () => {
        connectionMonitor.status = 200
        connectionMonitor.status = 500

        expect(mockStatusChangeCallback).not.toHaveBeenCalled()
      })

      it('should not trigger callback method if status does not change', () => {
        connectionMonitor.status = 200
        connectionMonitor.registerStatusChangeCallback(mockStatusChangeCallback)
        connectionMonitor.status = 200

        expect(mockStatusChangeCallback).not.toHaveBeenCalled()
      })
    })

    describe('registerStatusChangeCallback()', () => {
      it('should set class callback method if method is valid', () => {
        const registerCallback = () => {
          connectionMonitor.registerStatusChangeCallback()
        }

        expect(registerCallback).toThrowError('Status callback must be a function')
      })
    })
  })
})
