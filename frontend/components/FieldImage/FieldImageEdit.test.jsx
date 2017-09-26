import {h, options, render} from 'preact'
import {render as renderToString} from 'preact-render-to-string'
import htmlLooksLike from 'html-looks-like'
import {expect} from 'chai'

import * as utils from './../../lib/util'

utils.getUniqueId = () => 'c-1'

import FieldImageEdit from './FieldImageEdit'
import MockStore from './MockStore'

import Label from './../Label/Label'

// DOM setup
let $, mount, root, scratch

// jest.mock('./../../lib/util', () => ({
//   getUniqueId: () => 'c-1'
// }))

options.debounceRendering = f => f()

beforeAll(() => {
  $ = sel => scratch.querySelectorAll(sel)
  mount = jsx => root = render(jsx, scratch, root)
  scratch = document.createElement('div')
})

afterEach(() => {
  mount(null).remove()
})

const mockConfig = {
  FieldImage: {
    accept: 'test'
  }
}

const mockSchema = {
  _id: 'leadImage',
  type: 'Reference',
  label: 'Lead Image',
  message: 'JPEG or PNG',
  required: false,
  settings: {
    collection: 'mediaStore'
  },
  publish: {
    subType: 'Image',
    section: 'Article',
    placement: 'sidebar',
    display: {
      list: false,
      edit: true
    }
  }
}

describe('FieldImageEdit component', () => {
  it('has propTypes', () => {
    const component = (
      <FieldImageEdit />
    )

    expect(component.nodeName.propTypes).to.exist
    expect(Object.keys(component.nodeName.propTypes)).to.have.length.above(0)
  })

  it('renders a Label component', () => {
    const component = renderToString(
      <FieldImageEdit
        config={mockConfig}
        onBuildBaseUrl={() => '/hello'}
        schema={mockSchema}
      />
    )

    const label = renderToString(
      <Label
        label={mockSchema.label}
      >
        {'{{ ... }}'}
      </Label>
    )

    htmlLooksLike(component, label)
  })
})
