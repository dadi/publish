import {h, options, render} from 'preact'
import {expect} from 'chai'

jest.mock('lib/util', () => ({
  getUniqueId: () => 'c1'
}))

import FieldDateTimeList from './FieldDateTimeList'

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

const mockConfig = {
  formats: {
    date: {
      long: 'YYYY/MM/DD HH:mm'
    }
  }
}

const mockSchema = {
  _id: 'publishDate',
  type: 'DateTime',
  label: 'Publish date',
  required: false,
  publish: {
    section: 'Article',
    placement: 'sidebar',
    display: {
      list: false,
      edit: true
    }
  }
}

describe('FieldDateTimeList component', () => {
  it('has propTypes', () => {
    const component = (
      <FieldDateTimeList />
    )

    expect(component.nodeName.propTypes).to.exist
    expect(Object.keys(component.nodeName.propTypes)).to.have.length.above(0)
  })

  it('renders the text "Yes" if the `value` prop is truthy', () => {
    const component = render(
      <FieldDateTimeList
        value={true}
      />
    )

    expect(component.nodeValue).to.eql('Yes')
  })

  it('displays the formatted date, if valid, according to the format defined in config', () => {
    const mockDate = new Date()
    const mockDateFormat = mockConfig.formats.date.long
    const mockDateTime = new DateTime(mockDate.getTime(), mockDateFormat)
    const component = (
      <FieldDateTimeList
        config={mockConfig}
        schema={mockSchema}
        value={mockDate.getTime()}
      />
    )

    expect(component).to.contain(mockDateTime.format(mockDateFormat))
  })
})
