const globals = require(`${__dirname}/../../../../../app/globals`) // Always required
const Router = require(`${__dirname}/../../../../../app/lib/router`)
const restify = require('restify')
let router
let server

const clearSpies = () => {
  // Clear pre spy
  if (router.pre._isMockFunction) {
    router.pre.mockRestore()
  }

  if (router.pre._isMockFunction) {
    router.pre.mockRestore()
  }

  if (router.use.isMockFunction) {
    router.use.mockRestore()
  }

  if (router.setHeaders.isMockFunction) {
    router.setHeaders.mockRestore()
  }

  if (router.getRoutes.isMockFunction) {
    router.getRoutes.mockRestore()
  }

  if (router.componentRoutes.isMockFunction) {
    router.componentRoutes.mockRestore()
  }

  if (router.webRoutes.isMockFunction) {
    router.webRoutes.mockRestore()
  }

  if (server.pre.isMockFunction) {
    server.pre.mockRestore()
  }

}

beforeEach(() => {
  server = new restify.Server()
  router = new Router(server)
})

afterEach(() => {
  clearSpies()
})

describe('Router', () => {
  it('should export object', () => {
    expect(router).toBeInstanceOf(Object)
  })

  it('should append default paths, server and template html properties to module instance.', () => {
    expect(router)
      .toEqual(expect.objectContaining({
        publicDir: expect.any(String),
        routesDir: expect.any(String),
        server: expect.any(restify.Server),
        entryPointTemplate: expect.any(String)
      }))
  })

  describe('addRoutes()', () => {
    it('should return undefined if `server` is invalid', () => {
      router = new Router()

      const addRoutes = () => {
        router.addRoutes()
      }

      expect(addRoutes()).toBeUndefined()
    })

    it('should call pre method', () => {
      const preSpy = jest.spyOn(router, 'pre')

      router.addRoutes()

      expect(preSpy).toBeCalled()
    })

    it('should call use method', () => {
      const useSpy = jest.spyOn(router, 'use')

      router.addRoutes()

      expect(useSpy).toBeCalled()
    })

    it('should call setHeaders method', () => {
      const setHeadersSpy = jest.spyOn(router, 'setHeaders')

      router.addRoutes()

      expect(setHeadersSpy).toBeCalled()
    })

    it('should call getRoutes method', () => {
      const getRoutesSpy = jest.spyOn(router, 'getRoutes')

      router.addRoutes()

      expect(getRoutesSpy).toBeCalled()
    })

    it('should call componentRoutes method', () => {
      const componentRoutesSpy = jest.spyOn(router, 'componentRoutes')

      router.addRoutes()

      expect(componentRoutesSpy).toBeCalled()
    })

    it('should call webRoutes method', () => {
      const webRoutesSpy = jest.spyOn(router, 'webRoutes')

      router.addRoutes()

      expect(webRoutesSpy).toBeCalled()
    })
  })

  describe('pre()', () => {
    it('should return undefined if `server` is invalid', () => {
      router = new Router()

      const pre = () => {
        router.pre()
      }

      expect(pre()).toBeUndefined()
    })

    it('should add pre middleware to server before array', () => {
      router.pre()

      expect(server.before)
      .toEqual(expect.arrayContaining([expect.any(Function)]))
    })
  })

  describe('use()', () => {
    it('should return undefined if `server` is invalid', () => {
      router = new Router()

      const use = () => {
        router.use()
      }

      expect(use()).toBeUndefined()
    })

    it('should add use middleware to server chain array', () => {
      router.use()

      expect(server.chain)
      .toEqual(expect.arrayContaining([expect.any(Function)]))
    })
  })
})
