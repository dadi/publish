// API initialState variable references window.__documentRoutes__ 
// so define them first.
window.__documentRoutes__ = {
  create: [],
  edit: [],
  list: []
}

const API = require(`${__dirname}/../../../../frontend/reducers/api`)
const Types = require(`${__dirname}/../../../../frontend/actions/actionTypes`)
const Constants = require(`${__dirname}/../../../../frontend/lib/constants`)

let api

beforeEach(() => {
  api = API.default
})

describe('API', () => {
  it('should be an Object', () => {
    expect(API).toMatchObject(expect.any(Object))
  })

  describe('api()', () => {

    it('should return state object by default', () => {
      expect(api())
        .toMatchObject(API.initialState)
    })

    it('should set paths from window document routes', () => {
      expect(api())
        .toEqual(expect.objectContaining({
          paths: expect.objectContaining(window.__documentRoutes__)
        }))
    })

    it('should set api list', () => {
      const mockApis = {
        foo: 'bar'
      }
      const apiReducerCall = api(undefined, {
        apis: mockApis,
        type: Types.SET_API_LIST
      })

      expect(apiReducerCall)
        .toEqual(expect.objectContaining({
          ...API.initialState,
          apis: mockApis,
          status: Constants.STATUS_IDLE
        }))
    })

    it('should update api status', () => {
      const apiReducerCall = api(undefined, {
        status: 'MOCK_STATUS',
        type: Types.SET_API_STATUS
      })

      expect(apiReducerCall)
        .toEqual(expect.objectContaining({
          ...API.initialState,
          status: 'MOCK_STATUS'
        }))
    })

    it('should return state to initialState on signout', () => {
      const apiReducerCall = api(undefined, {
        type: Types.SIGN_OUT
      })

      expect(apiReducerCall)
        .toMatchObject(API.initialState)
    })
  })
})