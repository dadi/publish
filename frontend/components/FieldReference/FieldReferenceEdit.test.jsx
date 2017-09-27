import {h, options, render} from 'preact'
import {render as renderToString} from 'preact-render-to-string'
import {expect} from 'chai'

import FieldReferenceEdit from './FieldReferenceEdit'

import Button from 'components/Button/Button'
import Label from 'components/Label/Label'

jest.mock('lib/util', () => ({
  getUniqueId: () => 'c-1'
}))

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

const mockBuildBaseUrl = () => ['articles']

const mockReferencedCollectionSchema = {
  fields: {
    title: {
      type: 'String',
      label: 'Title',
      required: true,
      message: 'must be between 3 and 300 characters long',
      validation: {
        minLength: 3,
        maxLength: 300
      },
      publish: {
        section: 'Article',
        placement: 'main',
        display: {
          list: true,
          edit: true
        }
      }
    }
  },
  settings: {
    compose: true,
    cache: false,
    authenticate: true,
    callback: null,
    defaultFilters: null,
    fieldLimiters: null,
    count: 20,
    sort: 'title',
    sortOrder: 1,
    indexSearch: true,
    storeRevisions: true,
    revisionCollection: 'booksHistory',
    displayName: 'Books'
  }
}

const mockSchema = {
  _id: 'book',
  type: 'Reference',
  label: 'Book',
  required: false,
  settings: {
    collection: 'books'
  },
  publish: {
    section: 'Article',
    placement: 'sidebar',
    display: {
      list: false,
      edit: true
    }
  }
}

const mockApi = {
  collections: [
    {
      slug: 'books',
      fields: mockReferencedCollectionSchema.fields
    }
  ]
}

describe('FieldReferenceEdit component', () => {
  it('has propTypes', () => {
    const component = (
      <FieldReferenceEdit />
    )

    expect(component.nodeName.propTypes).to.exist
    expect(Object.keys(component.nodeName.propTypes)).to.have.length.above(0)
  })

  it('renders `null` if `settings.collection` is not defined', () => {
    const mockSchemaWithoutCollection = {
      ...mockSchema,
      settings: {}
    }

    const component = (
      <FieldReferenceEdit
        currentApi={mockApi}
        onBuildBaseUrl={mockBuildBaseUrl}
        schema={mockSchemaWithoutCollection}
      />
    )

     expect(renderToString(component)).to.eql('')
  })

  it('renders `null` if `settings.collection` contains a collection that does not exist in the current API', () => {
    const mockSchemaWithWrongCollection = {
      ...mockSchema,
      settings: {
        collection: 'IDoNotExist'
      }
    }

    const component = (
      <FieldReferenceEdit
        currentApi={mockApi}
        onBuildBaseUrl={mockBuildBaseUrl}
        schema={mockSchemaWithWrongCollection}
      />
    )

    expect(renderToString(component)).to.eql('')
  })

  it('renders a Label with the field\'s displayName', () => {
    const component = (
      <FieldReferenceEdit
        currentApi={mockApi}
        onBuildBaseUrl={mockBuildBaseUrl}
        schema={mockSchema}
      />
    )

    expect(component).to.matchTemplate(
      <Label
        label={mockSchema.label || mockSchema._id}
      >(...)</Label>
    )
  })

  describe('if the `value` prop is present', () => {
    it('renders a Remove button', () => {
      const component = (
        <FieldReferenceEdit
          currentApi={mockApi}
          onBuildBaseUrl={mockBuildBaseUrl}
          schema={mockSchema}
          value={{}}
        />
      )

      expect(component).to.contain(
        <Button
          accent="destruct"
          size="small"
        >Remove</Button>
      )
    })

    describe('renders a single value', () => {
      it('using the first field of type String found in the collection (if any)', () => {
        const mockValues = {
          title: 'A Tale of Two Cities'
        }

        const component = (
          <FieldReferenceEdit
            currentApi={mockApi}
            onBuildBaseUrl={mockBuildBaseUrl}
            schema={mockSchema}
            value={mockValues}
          />
        )

        expect(component).to.contain(
          <div>
            <p class="value">{mockValues.title}</p>
          </div>
        )
      })

      it('using a generic placeholder if the value of the first field of type String is null in the referenced document', () => {
        const component = (
          <FieldReferenceEdit
            currentApi={mockApi}
            onBuildBaseUrl={mockBuildBaseUrl}
            schema={mockSchema}
            value={{}}
          />
        )

        expect(component).to.contain(
          <div>
            <p class="value">Referenced {mockSchema.label}</p>
          </div>
        )
      })

      it('using a generic placeholder if the collection does not have a field of type String', () => {
        const mockReferencedCollectionSchemaWithNoStringFields = {
          ...mockReferencedCollectionSchema,
          fields: {
            numberOfPages: {
              type: 'Number',
              label: 'Number of pages',
              publish: {
                section: 'Article',
                placement: 'main',
                display: {
                  list: true,
                  edit: true
                }
              }
            }
          }
        }

        const mockValues = {
          numberOfPages: 850
        }

        const component = (
          <FieldReferenceEdit
            currentApi={mockApi}
            onBuildBaseUrl={mockBuildBaseUrl}
            schema={mockSchema}
            value={mockValues}
          />
        )

        expect(component).to.contain(
          <div>
            <p class="value">Referenced {mockSchema.label}</p>
          </div>
        )
      })
    })

    describe('renders multiple values', () => {
      it('using the first field of type String found in the collection (if any)', () => {
        const mockValues = [
          {
            title: 'A Tale of Two Cities'
          },
          {
            title: 'War and Peace'
          }
        ]

        const component = (
          <FieldReferenceEdit
            currentApi={mockApi}
            onBuildBaseUrl={mockBuildBaseUrl}
            schema={mockSchema}
            value={mockValues}
          />
        )

        expect(component).to.contain(
          <div>
            <p class="value">{mockValues[0].title}</p>
            <p class="value">{mockValues[1].title}</p>
          </div>
        )
      })

      it('using a generic placeholder if the value of the first field of type String is null in the referenced document', () => {
        const mockValues = [
          {},
          {}
        ]
        const component = (
          <FieldReferenceEdit
            currentApi={mockApi}
            onBuildBaseUrl={mockBuildBaseUrl}
            schema={mockSchema}
            value={mockValues}
          />
        )

        expect(component).to.contain(
          <div>
            <p class="value">Referenced {mockSchema.label}</p>
            <p class="value">Referenced {mockSchema.label}</p>
          </div>
        )
      })

      it('using a generic placeholder if the collection does not have a field of type String', () => {
        const mockReferencedCollectionSchemaWithNoStringFields = {
          ...mockReferencedCollectionSchema,
          fields: {
            numberOfPages: {
              type: 'Number',
              label: 'Number of pages',
              publish: {
                section: 'Article',
                placement: 'main',
                display: {
                  list: true,
                  edit: true
                }
              }
            }
          }
        }

        const mockValues = [
          {
            numberOfPages: 850
          },
          {
            numberOfPages: 456
          }
        ]

        const component = (
          <FieldReferenceEdit
            currentApi={mockApi}
            onBuildBaseUrl={mockBuildBaseUrl}
            schema={mockSchema}
            value={mockValues}
          />
        )

        expect(component).to.contain(
          <div>
            <p class="value">Referenced {mockSchema.label}</p>
            <p class="value">Referenced {mockSchema.label}</p>
          </div>
        )
      })
    })

    it('fires the `onChange` callback when the "Remove" button is clicked', () => {
      const onChange = jest.fn()
      const mockValues = {
        title: 'A Tale of Two Cities'
      }

      mount(
        <FieldReferenceEdit
          currentApi={mockApi}
          onBuildBaseUrl={mockBuildBaseUrl}
          onChange={onChange}
          schema={mockSchema}
          value={mockValues}
        />
      )

      $('button')[0].click()

      expect(onChange.mock.calls.length).to.eql(1)
      expect(onChange.mock.calls[0][0]).to.eql(mockSchema._id)
      expect(onChange.mock.calls[0][1]).to.eql(null)
    })
  })

  describe('if the `value` prop is missing', () => {
    it('renders a button to select existing documents', () => {
      const component = (
        <FieldReferenceEdit
          currentApi={mockApi}
          onBuildBaseUrl={mockBuildBaseUrl}
          schema={mockSchema}
        />
      )

      expect(component).to.contain(
        <Button
          accent="data"
          href={`/${mockBuildBaseUrl()}/select/${mockSchema._id}`}
          size="small"
        >Select existing {mockSchema.label.toLowerCase()}</Button>
      )
    })
  })
})