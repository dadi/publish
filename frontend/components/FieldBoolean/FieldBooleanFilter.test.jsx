import {h, options, render} from 'preact'
import {expect} from 'chai'

jest.mock('lib/util', () => ({
  getUniqueId: () => 'c1'
}))

import FieldBooleanFilter from './FieldBooleanFilter'

// DOM setup
let $, mount, root, scratch

options.debounceRendering = f => f()

beforeAll(() => {
  $ = sel => scratch.querySelectorAll(sel)
  mount = jsx => {
    root = render(jsx, scratch, root)

    document.body.appendChild(scratch)

    return root
  }
  scratch = document.createElement('div')
})

afterEach(() => {
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild)
  }  
})

describe('FieldBooleanFilter component', () => {
  it('has propTypes', () => {
    const component = (
      <FieldBooleanFilter />
    )

    expect(component.nodeName.propTypes).to.exist
    expect(Object.keys(component.nodeName.propTypes)).to.have.length.above(0)
  })

  it('renders a container with the classes given in the `containerStyles` prop', () => {
    const component = render(
      <FieldBooleanFilter
        containerStyles="class-1 class-2"
      />
    )

    expect(component.className).to.eql('class-1 class-2')
  })

  it('renders a select input element with the classes given in the `analyserStyles` prop and Yes/No options', () => {
    const component = (
      <FieldBooleanFilter
        analyserStyles="class-1 class-2"
      />
    )

    expect(component).to.contain(
      <select class="class-1 class-2" value="false">
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>
    )
  })

  it('fires the `onChange` prop with the name of the field and the new value converted to Boolean when a new value is selected', () => {
    const callback = jest.fn()

    mount(
      <FieldBooleanFilter
        analyserStyles="analyser"
        index={3}
        onUpdate={callback}
        value={false}
      />
    )

    const $analyser = $('.analyser')[0]

    expect($analyser.value).to.eql('false')

    $analyser.value = 'true'

    const changeEvent = document.createEvent('HTMLEvents')
    changeEvent.initEvent('change', false, true)
    $analyser.dispatchEvent(changeEvent)

    expect($analyser.value).to.eql('true')
    expect(callback.mock.calls[0][0]).to.eql({value: true})
    expect(callback.mock.calls[0][1]).to.eql(3)
  })
})
