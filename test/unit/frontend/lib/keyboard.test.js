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

  window.removeEventListener = jest.fn((event, cb) => {
    delete map[event]
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

    describe('findShortcut', () => {
      it('should return matching pattern instance', () => {
        keyboard.on('backspace')
          .do(jest.fn())

        expect(keyboard.findShortcut(8))
          .toBeInstanceOf(KeyboardController.Pattern)
      })

      it('should return undefined if no matching pattern', () => {
        keyboard.on('backspace')
          .do(jest.fn())

        expect(keyboard.findShortcut(7))
          .toBeUndefined()
      })
    })

    describe('on', () => {
      it('should throw an error if pattern is invalid', () => {

        const keyboardAddOn = () => {
          keyboard.on(undefined)
        }
        expect(keyboardAddOn)
          .toThrowError('Invalid keyboard pattern')
      })

      it('should throw an error if one or more pattern key is invalid', () => {
        const keyboardAddOn = () => {
          keyboard.on('cmd+foo')
        }
        expect(keyboardAddOn)
          .toThrowError('Invalid keyboard pattern')
      })

      it('should push vald shortcuts into list', () => {
        keyboard.on('backspace')

        expect(keyboard.shortcuts)
          .toHaveLength(1)
      })

      it('should return instance of Pattern', () => {
        expect(keyboard.on('backspace'))
          .toBeInstanceOf(KeyboardController.Pattern)
      })
    })

    describe('off', () => {
      it('should call removeEventListener method on window', () => {
        window.addEventListener('keydown', () => {})
        keyboard.off()
        expect(window.removeEventListener)
          .toHaveBeenCalled()
      })

      it('should remove keydown events', () => {
        window.addEventListener('keydown', () => {})
        keyboard.off()
        expect(map.keydown)
          .toBeUndefined()
      })

      it('should call removeEventListener method on window', () => {
        window.addEventListener('keyup', () => {})
        keyboard.off()
        expect(window.removeEventListener)
          .toHaveBeenCalled()
      })

      it('should remove keyup events', () => {
        window.addEventListener('keyup', () => {})
        keyboard.off()
        expect(map.keyup)
          .toBeUndefined()
      })
    })
  })
  describe('Class Keys', () => {
    it('should be an Object', () => {
      expect(keys).toMatchObject(expect.any(Object))
    })

    describe('keys', () => {
      it('should return keys appended with all possible letter codes', () => {
        expect(keys.keys).toEqual(expect.objectContaining({
          z: 90
        }))
      })

      it('should return keys appended with all possible number codes', () => {
        expect(keys.keys).toEqual(expect.objectContaining({
          1: 49
        }))
      })

      it('should return keys appended with all possible function codes', () => {
        expect(keys.keys).toEqual(expect.objectContaining({
          f1: 112
        }))
      })

      it('should return keys appended with all possible numpad codes', () => {
        expect(keys.keys).toEqual(expect.objectContaining({
          'numpad *': 106
        }))
      })
    })

    describe('find()', () => {
      it('should returning matching keycodes', () => {
        expect(keys.find(['cmd']))
          .toEqual(expect.arrayContaining([91]))
      })

      it('should only return matching keys', () => {
        expect(keys.find(['cmd', 'foo']))
          .toEqual(expect.arrayContaining([91]))
      })
    })
  })

  describe('Class Pattern', () => {
    it('should be an Object', () => {
      expect(pattern).toMatchObject(expect.any(Object))
    })

    describe('next()', () => {
      it('should return undefined if callback is not set', () => {
        expect(pattern.next()).toBeUndefined()
      })

      it('should trigger callback method if last key is reached', () => {
        const mockPattern = 'cmd+del'
        const mockKeys = [91, 46]
        pattern = new KeyboardController.Pattern(mockPattern, mockKeys)
        pattern.do(keyboardCallback)
        pattern.next(mockKeys[0])
        pattern.next(mockKeys[1])

        expect(keyboardCallback)
          .toHaveBeenCalledWith(expect.objectContaining({
            keys: mockKeys,
            pattern: mockPattern
          }))
      })

      it('should return true if last key is reached', () => {
        const mockPattern = 'cmd+del'
        const mockKeys = [91, 46]
        pattern = new KeyboardController.Pattern(mockPattern, mockKeys)
        pattern.do(keyboardCallback)
        pattern.next(mockKeys[0])

        expect(pattern.next(mockKeys[1]))
          .toBeTruthy()
      })

      it('should not trigger callback if pattern is not met', () => {
        const mockPattern = 'cmd'
        const mockKeys = [91]
        pattern = new KeyboardController.Pattern(mockPattern, mockKeys)
        pattern.do(keyboardCallback)

        expect(pattern.next(92))
          .toBeUndefined()
      })

      it('should reset active if keycode does not match expected pattern key', () => {
        const mockPattern = 'cmd+del'
        const mockKeys = [91, 46]
        pattern = new KeyboardController.Pattern(mockPattern, mockKeys)
        pattern.do(keyboardCallback)
        pattern.next(mockKeys[0])
        pattern.next(1)

        expect(pattern.active).toBe(0)
      })

      it('should not trigger callback method if key is incorrect', () => {
        const mockPattern = 'cmd+del'
        const mockKeys = [91, 46]
        pattern = new KeyboardController.Pattern(mockPattern, mockKeys)
        pattern.do(keyboardCallback)
        pattern.next(mockKeys[0])
        pattern.next(1)

        expect(keyboardCallback).not.toHaveBeenCalled()
      })
    })

    describe('reset()', () => {
      it('should reset active position to 0', () => {
        pattern.active = 10
        pattern.reset()
        expect(pattern.active).toBe(0)
      })
    })

    describe('do()', () => {
      it('should reject invalid callback', () => {
        const addDo = () => {
          pattern.do()
        }
        expect(addDo).toThrowError('Invalid keyboard callback method')
      })

      it('should set class callback to be recieved method', () => {
        pattern.do(() => {})
        expect(pattern.callback).toBeInstanceOf(Function)
      })
    })
  })
})