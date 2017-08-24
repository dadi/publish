const globals = require(`${__dirname}/../../../../app/globals`) // Always required
const Constants = require(`${__dirname}/../../../../app/lib/constants`)


describe('Constants', () => {
  it('should export object', () => {
    expect(Constants).toBeInstanceOf(Object)
  })
})
