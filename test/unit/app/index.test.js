const globals = require(`${__dirname}/../../../app/globals`) // Always required
const app = require(`${__dirname}/../../../app`)
const Server = require(`${__dirname}/../../../app/lib/server`).Server

describe('App', () => {
  it('should export object', () => {
    expect(app).toBeInstanceOf(Object)
  })

  describe('start()', () => {
    it('should set property this.server to be instance of Server.', () => {
      app.start()
      expect(app.server)
        .toBeInstanceOf(Server)
    })

    it('should return a promise.', () => {
      app.start()
      expect(app.start())
        .toBeInstanceOf(Promise)
    })
  })
})

