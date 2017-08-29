const globals = require(`${__dirname}/../../../../../app/globals`) // Always required
const Format = require(`${__dirname}/../../../../../frontend/lib/util/string`).Format

describe('StringUtil', () => {
  it('should be an Object', () => {
    expect(Format).toMatchObject(expect.any(Object))
  })

  describe('sentenceCase()', () => {
    it('should return empty string if value is missing', () => {
      expect(Format.sentenceCase())
        .toBe('')
    })

    it('should return empty string if value is invalid', () => {
      expect(Format.sentenceCase({}))
        .toBe('')
    })

    it('should convert string into sentenceCase', () => {
      expect(Format.sentenceCase('foo bar'))
        .toBe('Foo bar')
    })
  })

  describe('slugify', () => {
    it('should return empty string if value is missing', () => {
      expect(Format.slugify())
        .toBe('')
    })

    it('should return empty string if value is invalid', () => {
      expect(Format.slugify({}))
        .toBe('')
    })

    it('should convert and return input value into url friendly string', () => {
      expect(Format.slugify('foo bar'))
        .toBe('foo-bar')
    })
  })
})