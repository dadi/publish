const globals = require(`${__dirname}/../../../../app/globals`) // Always required
const Keyboard = require(`${__dirname}/../../../../frontend/lib/keyboard`)

let keyboard
let windowEventListenerSpy
let map

beforeEach(() => {
  keyboard = new Keyboard.Keyboard()
  map = {}

  window.addEventListener = jest.fn((event, cb) => {
    map[event] = cb
  })

})

describe('Keyboard', () => {
  it('should be an Object', () => {
    expect(Keyboard).toMatchObject(expect.any(Object))
  })

  describe('listen()', () => {
    it('should add keydown event to window', () => {
      keyboard.listen()
      expect(map.keydown)
        .toBeInstanceOf(keyboard.keydown.constructor)
    })

    it('should add keyup event to window', () => {
      keyboard.listen()
      expect(map.keyup)
        .toBeInstanceOf(keyboard.keyup.constructor)
    })

    it('should not attempt to add event listeners if window.addEventListener is invalid', () => {
      window.addEventListener = null
      keyboard.listen()

      expect(map)
        .toEqual(expect.objectContaining({}))
    })
  })
})