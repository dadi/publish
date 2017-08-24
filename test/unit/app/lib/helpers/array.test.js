const globals = require(`${__dirname}/../../../../../app/globals`) // Always required
const array = require(`${__dirname}/../../../../../app/lib/helpers/array`)

describe('String', () => {
  it('should export object', () => {
    expect(array).toBeInstanceOf(Object)
  })

  describe('Reduce', () => {
    it('should return undefined when arrays are invalid', () => {
      expect(array.reduce())
        .toBeUndefined()
    })

    it('should concatinate multiple arrays', () => {
      expect(array.reduce([[1, 2],[3, 4]]))
        .toEqual(expect.arrayContaining([1, 2, 3, 4]))
    })
  })

  describe('Unique', () => {
    it ('should return undefined when arrays are invalid', () => {
      expect(array.unique())
        .toBeUndefined()
    })

    it ('should filter duplicate values in array', () => {
      const arrayWithDuplicates = ['foo', 'bar', 'foo']

      const reducedArray = arrayWithDuplicates.filter(array.unique)

      expect(reducedArray)
        .toEqual(expect.arrayContaining(['foo', 'bar']))
    })
  })
})

