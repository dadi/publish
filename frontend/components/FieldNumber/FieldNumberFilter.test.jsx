import {h, options, render} from 'preact'
import {expect} from 'chai'
import {render as r} from 'preact-render-to-string'
import FieldNumberFilter from './FieldNumberFilter'

import TextInput from 'components/TextInput/TextInput'

// DOM setup
let $, mount, root, scratch

options.debounceRendering = f => f()

beforeAll(() => {
  $ = sel => scratch.querySelectorAll(sel)
  mount = jsx => root = render(jsx, scratch, root)
  scratch = document.createElement('div')
})

afterEach(() => {
  mount(null).remove()
})

describe('FieldNumberFilter component', () => {
  it('has propTypes', () => {
    const component = (
      <FieldNumberFilter />
    )

    expect(component.nodeName.propTypes).to.exist
    expect(Object.keys(component.nodeName.propTypes)).to.have.length.above(0)
  })

  it('renders a container div with the classes passed in the `containerStyles` prop', () => {
    const component = (
      <FieldNumberFilter
        containerStyles="container-class-1 container-class-2"
      />
    )

    expect(component).to.matchTemplate(
      <div class="container-class-1 container-class-2">
        (...)
      </div>
    )
  })

  describe('renders a select input', () => {
    it('with the classes passed in the `analyserStyles` prop, a placeholder option and an option for each filter type', () => {
      let componentRef

      const component = (
        <FieldNumberFilter
          analyserStyles="analyser-class-1"
          ref={c => componentRef = c}
        />
      )

      mount(component)

      expect(component).to.contain(
        <select class="analyser-class-1">
          <option disabled>Select a type</option>

          {Object.keys(componentRef.filterTypes).map(filterType => (
            <option key={filterType} value={filterType}>
              {componentRef.filterTypes[filterType]}
            </option>
          ))}
        </select>
      )
    })

    it('selects the option corresponding to the value in the `type` prop', () => {
      mount(
        <FieldNumberFilter
          analyserStyles="analyser-class"
          type="$lt"
        />
      )

      expect($('select.analyser-class')[0].value).to.eql('$lt')
    })
  })

  // it('fires the `onUpdate` callback when the selected option changes', () => {
  //   const onUpdate = jest.fn()

  //   mount(
  //     <FieldNumberFilter
  //       analyserStyles="analyser-class"
  //       onUpdate={onUpdate}
  //     />
  //   )

  //   const $select = $('select.analyser-class')[0]

  //   $select.value = '$gte'
  //   $select.dispatchEvent(new Event('change'))

  //   console.log(onUpdate.mock.calls)
  // })

  describe('renders a TextInput of type "number"', () => {
    it('with the classes passed in the `valueStyles` prop', () => {
      const component = (
        <FieldNumberFilter
          valueStyles="value-class-1 value-class-2"
        />
      )

      expect(component).to.contain(
        <TextInput
          className="value-class-1 value-class-2"
          type="number"
          placeholder="Numeric value"
        />
      )
    })

    it('with the value passed in the `value` prop', () => {
      const component = (
        <FieldNumberFilter
          value={1337}
        />
      )

      expect(component).to.contain(
        <TextInput
          type="number"
          placeholder="Numeric value"
          value={1337}
        />
      )
    })
  })
})
