import {h, options, render} from 'preact'
import {expect} from 'chai'

import FieldStringList from './FieldStringList'

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

const mockSchema = {
  _id: 'subtitle',
  type: 'String',
  label: 'Sub Heading',
  validation: {},
  required: false,
  publish: {
    section: 'Article',
    placement: 'main'
  }
}

const mockSchemaWithOptions = {
  _id: 'siteType',
  type: 'String',
  label: 'Site type',
  default: 'personal',
  validation: {
    regex: {
      pattern: '[personal|blog|news|commerce|other]'
    }
  },
  required: false,
  publish: {
    section: 'Meta',
    placement: 'sidebar',
    display: {
      list: true,
      edit: true
    },
    readonly: false,
    options: [
      {
        value: 'personal',
        label: 'Personal site'
      },
      {
        value: 'blog',
        label: 'Blog'
      },
      {
        value: 'news',
        label: 'News'
      },
      {
        value: 'commerce',
        label: 'E-commerce'
      },
      {
        value: 'other',
        label: 'Other'
      }
    ]
  }
}

describe('FieldStringList component', () => {
  it('has propTypes', () => {
    const component = (
      <FieldStringList />
    )

    expect(component.nodeName.propTypes).to.exist
    expect(Object.keys(component.nodeName.propTypes)).to.have.length.above(0)
  })

  it('renders `null` if the `value` prop is falsy', () => {
    const component = (
      <FieldStringList
        value={false}
      />
    )

    expect(component).to.eql(null)
  })

  describe('if the schema contains an `options` object', () => {
    describe('renders the `label` property of the options in the object that match the individual options in `value`', () => {
      it('displays all the options if they are less than `maxOptions`', () => {
        const component = (
          <FieldStringList
            maxOptions={2}
            schema={mockSchemaWithOptions}
            value={['blog', 'commerce']}
          />
        )

        expect(component).to.eql('Blog, E-commerce')
      })

      it('displays the options that fit in `maxOptions` and the number of the excess', () => {
        const component = (
          <FieldStringList
            maxOptions={1}
            schema={mockSchemaWithOptions}
            value={['blog', 'commerce']}
          />
        )

        expect(component).to.eql('Blog + 1')
      })

      it('trims values so that the result string is no longer than `maxLength`', () => {
        const component = (
          <FieldStringList
            maxLength={10}
            maxOptions={2}
            schema={mockSchemaWithOptions}
            value={['blog', 'commerce']}
          />
        )

        expect(component).to.eql('Blog, E-co…')
      })
    })

    describe('renders the individual options if they don\'t match anything in the `options` block', () => {
      it('displays all the options if they are less than `maxOptions`', () => {
        const component = (
          <FieldStringList
            maxOptions={2}
            schema={mockSchemaWithOptions}
            value={['something', 'else']}
          />
        )

        expect(component).to.eql('something, else')
      })

      it('displays the options that fit in `maxOptions` and the number of the excess', () => {
        const component = (
          <FieldStringList
            schema={mockSchemaWithOptions}
            value={['something', 'else']}
          />
        )

        expect(component).to.eql('something + 1')
      })

      it('trims values so that the result string is no longer than `maxLength`', () => {
        const component = (
          <FieldStringList
            maxLength={10}
            maxOptions={2}
            schema={mockSchemaWithOptions}
            value={['something', 'else']}
          />
        )

        expect(component).to.eql('some…, else')
      })
    })
  })
})
