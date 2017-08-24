const globals = require(`${__dirname}/../../app/globals`) // Always required
const schema = require(`${__dirname}/../../app/config-schema`)
const convict = require('convict')


describe('Schema', () => {
  it('should export object', () => {
    expect(schema).toBeInstanceOf(Object)
  })
  
  it('should be compatible with convict', () => {
    expect(convict(schema).getProperties())
      .toEqual(expect.any(Object))
  })
})
