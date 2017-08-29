const globals = require(`${__dirname}/../../../../../app/globals`) // Always required
const Validation = require(`${__dirname}/../../../../../frontend/lib/util/validation`).default

let validation

beforeEach(() => {
  validation = new Validation()
})

describe('Validation', () => {
  it('should export object', () => {
    expect(validation).toMatchObject(expect.any(Object))
  })

  describe('email()', () => {
    it('should return empty string if value is missing', () => {
      expect(validation.email())
        .toBeFalsy()
    })

    it('should return empty string if value is invalid', () => {
      expect(validation.email({}))
        .toBeFalsy()
    })

    it('should return falsy if supplied string is not a valid email', () => {
      expect(validation.email('foo$bar.com'))
        .toBeFalsy()
    })

    it('should return true if supplied string is not a valid email', () => {
      expect(validation.email('foo@bar.com'))
        .toBeTruthy()
    })
  })
})