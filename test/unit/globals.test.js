const globals = require(`${__dirname}/../../app/globals`) // Always required

describe('Globals', () => {
  it('should export object', () => {
    expect(globals).toBeInstanceOf(Object)
  })
})

