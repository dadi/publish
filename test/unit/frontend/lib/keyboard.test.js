const globals = require(`${__dirname}/../../../../app/globals`) // Always required
const KeyboardController = require(`${__dirname}/../../../../frontend/lib/keyboard`)

let keyboard
let pattern
let keys
let windowEventListenerSpy
let map

const mockPreventDefault = jest.fn()
const keyboardCallback = jest.fn()
const mockCallbackReset = jest.fn()

beforeEach(() => {
  keyboard = new KeyboardController.Keyboard()
  pattern = new KeyboardController.Pattern()
  keys = new KeyboardController.Keys()
  map = {}

  mockPreventDefault.mockReset()
  keyboardCallback.mockReset()
  mockCallbackReset.mockReset()

  window.addEventListener = jest.fn((event, cb) => {
    map[event] = cb
  })
})

describe('Keyboard', () => {
  it('should be an Object', () => {
    expect(KeyboardController).toMatchObject(expect.any(Object))
  })

  describe('Class Keyboard', () => {
    it('should be an Object', () => {
      expect(keyboard).toMatchObject(expect.any(Object))
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

    describe('keydown()', () => {
      it('should not attempt to trigger a callback when callback unspecified', () => {
        // Define a shortcut
        keyboard.on('backspace')

        const event = {
          keyCode: 8,
          preventDefault: mockPreventDefault
        }
        keyboard.keydown(event)
        expect(keyboardCallback).not.toHaveBeenCalled()
      })

      it('should prevent default if the sequence matches', () => {
        // Define a shortcut
        keyboard.on('backspace')
          .do(keyboardCallback)

        const event = {
          keyCode: 8,
          preventDefault: mockPreventDefault
        }
        keyboard.keydown(event)
        expect(mockPreventDefault).toHaveBeenCalled()
      })

      it('should trigger a callback if sequence matches', () => {
        // Define a shortcut
        keyboard.on('backspace')
          .do(keyboardCallback)

        const event = {
          keyCode: 8,
          preventDefault: mockPreventDefault
        }
        keyboard.keydown(event)
        expect(keyboardCallback).toHaveBeenCalled()
      })
    })

    describe('keyup()', () => {
      it('should reset all patterns', () => {
        keyboard.shortcuts = [{
          reset: mockCallbackReset
        },
        {
          reset: mockCallbackReset
        }]

        const event = {
          preventDefault: mockPreventDefault
        }

        keyboard.keyup(event)

        expect(mockCallbackReset).toHaveBeenCalledTimes(2)
      })

      it('should always call event.preventDefault', () => {
        const event = {
          preventDefault: mockPreventDefault
        }
        keyboard.keyup(event)

        expect(mockPreventDefault).toHaveBeenCalled()
      })
    })
  })
})