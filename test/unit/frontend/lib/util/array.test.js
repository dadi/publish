const globals = require(`${__dirname}/../../../../../app/globals`) // Always required
const ArrayUtil = require(`${__dirname}/../../../../../frontend/lib/util/array`)

describe('Array', () => {
  it('should export object', () => {
    expect(ArrayUtil).toMatchObject(expect.any(Object))
  })

  describe('Reduce', () => {
    it('should return undefined when arrays are invalid', () => {
      expect(ArrayUtil.reduce())
        .toBeUndefined()
    })

    it('should concatinate multiple arrays', () => {
      expect(ArrayUtil.reduce([[1, 2],[3, 4]]))
        .toEqual(expect.arrayContaining([1, 2, 3, 4]))
    })
  })
})