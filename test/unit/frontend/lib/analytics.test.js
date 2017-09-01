const globals = require(`${__dirname}/../../../../app/globals`) // Always required
const Analytics = require(`${__dirname}/../../../../frontend/lib/analytics`).default

let analytics
const injectScriptSpy = jest.spyOn(Analytics.prototype, 'injectScript')
const mockGA = jest.fn()
const mockClientId = 'XXXXX'
const mockTrackerGet = jest.fn(() => {
  return mockClientId
})

beforeEach(() => {
  injectScriptSpy.mockReset()
  mockGA.mockReset()
  mockTrackerGet.mockClear()
  analytics = new Analytics()
  window.ga = undefined
})

describe('Analytics', () => {
  it('should be Function', () => {
    expect(Analytics).toBeInstanceOf(Function)
  })

  describe('Analytics constructor', () => {
    it('should call injectScript', () => {
      expect(injectScriptSpy)
        .toHaveBeenCalled()
    })
  })

  describe('register()', () => {
    it('should throw an error if trackingId is invalid', () => {
      const register = () => {
        analytics.register()
      }   

      expect(register).toThrowError('trackingId is invalid')   
    })

    it('should throw an error if ga is not a function', () => {
      const register = () => {
        analytics.register('X-XXXXXX')
      }   

      expect(register).toThrowError('ga not initialised')   
    })

    it('should throw an error if ga is not a function', () => {
      window.ga = mockGA
      analytics.register('X-XXXXXX')

      expect(mockGA).toHaveBeenCalledWith(expect.any(Function))
      expect(mockGA).toHaveBeenCalledWith('create', 'X-XXXXXX', 'auto')
    })
  })

  describe('pageview()', () => {
    it('should throw an error if the path is invalid', () => {
      window.ga = mockGA

      const pageview = () => {
        analytics.pageview()
      }

      expect(pageview).toThrowError('Invalid pageview path')
    })

    it('should now call window.ga if trackingId is not defined', () => {
      window.ga = mockGA

      expect(mockGA).not.toHaveBeenCalled()
    })

    it('should call ga pageview send when trackingId is valid', () => {
      window.ga = mockGA
      analytics.register('X-XXXXXX')
      analytics.pageview('/foo')

      expect(mockGA).toHaveBeenCalledWith('send', 'pageview', '/foo')
    })
  })

  describe('isActive()', () => {
    it('should return false if trackingId is not set', () => {
      window.ga = mockGA
      expect(analytics.isActive()).toBeFalsy()
    })

    it('should return false if cliendId is not set', () => {
      window.ga = mockGA
      analytics.register('X-XXXXXX')

      expect(analytics.isActive()).toBeFalsy()
    })

    it('should return true if trackidId and cliendId are defined', () => {
      window.ga = mockGA
      analytics.clientId = 'XXXXXXX'
      analytics.register('X-XXXXXX')

      expect(analytics.isActive()).toBeTruthy()
    })
  })

  describe('getClientId', () => {
    it('should call tracker.get', () => {
      analytics.getClientId({
        get: mockTrackerGet
      })
      expect(mockTrackerGet).toHaveBeenCalledWith('clientId')
    })

    it('should set clientId with result of tracker.get', () => {
      analytics.getClientId({
        get: mockTrackerGet
      })
      expect(analytics.clientId).toBe(mockClientId)
    })
  })
})