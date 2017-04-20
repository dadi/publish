const assert = require('assert')

const globals = require(`${__dirname}/../../app/globals`) // Always required
const config = require(`${__dirname}/../../app/config`)

describe('Config', function() {
  // Temporary
  describe('#getFrontendProps()', () => {
    it('should return -1 when the value is not present', () => {
      assert.equal(-1, [1,2,3].indexOf(4))
    })
  })
})