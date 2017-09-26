import {h, options, render} from 'preact'
import {expect} from 'chai'

import * as utils from 'lib/util'

utils.getUniqueId = () => 'c-1'

import FieldImageEdit from './FieldImageEdit'
import MockStore from './MockStore'

import * as Constants from 'lib/constants'
import Button from 'components/Button/Button'
import DropArea from 'components/DropArea/DropArea'
import FileUpload from 'components/FileUpload/FileUpload'
import Label from 'components/Label/Label'
import LazyLoader from 'containers/LazyLoader/LazyLoader'

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
    const component = (
      <FieldImageEdit
        config={mockConfig}
        onBuildBaseUrl={mockBuildBaseUrl}
        schema={mockSchema}
      />
    )

    const label = (
      <Label
        label={mockSchema.label}
      >(...)</Label>
    )

    expect(component).to.matchTemplate(label)
  })

  describe('renders thumbnails', () => {
    it('when the `value` prop contains an image', () => {
      const component = (
        <MockStore>
          <FieldImageEdit
            config={mockConfig}
            onBuildBaseUrl={mockBuildBaseUrl}
            schema={mockSchema}
            value={{url: 'https://cdn.somedomain.tech/test.jpg'}}
          />
        </MockStore>
      )

      const images = (
        <MockStore>
          <div class="thumbnails">
            <LazyLoader
              styles="thumbnail"
              src="https://cdn.somedomain.tech/test.jpg"
            />
          </div>
        </MockStore>
      )

      expect(component).to.contain(images)
    })

    it('when the `value` prop contains multiple images', () => {
      const component = (
        <MockStore>
          <FieldImageEdit
            config={mockConfig}
            onBuildBaseUrl={mockBuildBaseUrl}
            schema={mockSchema}
            value={[
              {url: 'https://cdn.somedomain.tech/test1.jpg'},
              {url: 'https://cdn.somedomain.tech/test2.jpg'},
              {url: 'https://cdn.somedomain.tech/test3.jpg'}
            ]}
          />
        </MockStore>
      )

      const images = (
        <MockStore>
          <div class="thumbnails">
            <LazyLoader
              styles="thumbnail"
              src="https://cdn.somedomain.tech/test1.jpg"
            />
            <LazyLoader
              styles="thumbnail"
              src="https://cdn.somedomain.tech/test2.jpg"
            />
            <LazyLoader
              styles="thumbnail"
              src="https://cdn.somedomain.tech/test3.jpg"
            />
          </div>
        </MockStore>
      )

      expect(component).to.contain(images)
    })

    it('when the `value` prop contains a raw image', () => {
      const component = (
        <MockStore>
          <FieldImageEdit
            config={mockConfig}
            onBuildBaseUrl={mockBuildBaseUrl}
            schema={mockSchema}
            value={{_previewData: '123456789'}}
          />
        </MockStore>
      )

      const images = (
        <MockStore>
          <div class="thumbnails">
            <LazyLoader
              styles="thumbnail"
              src="123456789"
            />
          </div>
        </MockStore>
      )

      expect(component).to.contain(images)
    })

    it('when the `value` prop contains multiple raw images', () => {
      const component = (
        <MockStore>
          <FieldImageEdit
            config={mockConfig}
            onBuildBaseUrl={mockBuildBaseUrl}
            schema={mockSchema}
            value={[
              {_previewData: '123456789'},
              {_previewData: '234567891'},
              {_previewData: '345678912'}
            ]}
          />
        </MockStore>
      )

      const images = (
        <MockStore>
          <div class="thumbnails">
            <LazyLoader
              styles="thumbnail"
              src="123456789"
            />
            <LazyLoader
              styles="thumbnail"
              src="234567891"
            />
            <LazyLoader
              styles="thumbnail"
              src="345678912"
            />
          </div>
        </MockStore>
      )

      expect(component).to.contain(images)
    })
  })

  it('fires the `onChange` callback with the name of the field when the Delete button is clicked', () => {
    const onChange = jest.fn()

    mount(
      <MockStore>
        <FieldImageEdit
          config={mockConfig}
          onBuildBaseUrl={mockBuildBaseUrl}
          onChange={onChange}
          schema={mockSchema}
          value={[
            {url: 'https://cdn.somedomain.tech/test1.jpg'},
            {url: 'https://cdn.somedomain.tech/test2.jpg'},
            {url: 'https://cdn.somedomain.tech/test3.jpg'}
          ]}
        />
      </MockStore>
    )

    $('button.remove-existing')[0].click()

    expect(onChange.mock.calls.length).to.eql(1)
    expect(onChange.mock.calls[0][0]).to.eql(mockSchema._id)
    expect(onChange.mock.calls[0][1]).isNull
  })

  describe('renders a DropArea if the `value` prop is missing', () => {
    it('with the text "Drop image" (singular) if the field schema\'s `limit` property is `1`', () => {
      const mockSchemaWithLimit = {
        ...mockSchema,
        settings: {
          ...mockSchema.settings,
          limit: 1
        }
      }

      const component = (
        <MockStore>
          <FieldImageEdit
            config={mockConfig}
            onBuildBaseUrl={mockBuildBaseUrl}
            schema={mockSchemaWithLimit}
          />
        </MockStore>
      )

      const template = (
        <Label label={mockSchema.label}>
          <DropArea
            draggingText="Drop image here"
            onDrop={() => {}}
          >(...)</DropArea>
        </Label>
      )

      expect(component).to.matchTemplate(template)
    })

    it('with the text "Drop images" (plural) if the field schema\'s `limit` property is missing or greater than `1`', () => {
      const mockSchemaWithLimit = {
        ...mockSchema,
        settings: {
          ...mockSchema.settings,
          limit: 4
        }
      }

      const component1 = (
        <MockStore>
          <FieldImageEdit
            config={mockConfig}
            onBuildBaseUrl={mockBuildBaseUrl}
            schema={mockSchemaWithLimit}
          />
        </MockStore>
      )

      const component2 = (
        <MockStore>
          <FieldImageEdit
            config={mockConfig}
            onBuildBaseUrl={mockBuildBaseUrl}
            schema={mockSchema}
          />
        </MockStore>
      )

      const template = (
        <Label label={mockSchema.label}>
          <DropArea
            draggingText="Drop images here"
            onDrop={() => {}}
          >(...)</DropArea>
        </Label>
      )

      expect(component1).to.matchTemplate(template)
      expect(component2).to.matchTemplate(template)
    })

    it('renders a placeholder with a button to add images', () => {
      const component = (
        <FieldImageEdit
          config={mockConfig}
          onBuildBaseUrl={mockBuildBaseUrl}
          schema={mockSchema}
        />
      )

      expect(component).to.contain(
        <div class="placeholder">
          <Button
            accent="data"
            size="small"
            href={`/${mockBuildBaseUrl()}/select/${mockSchema._id}`}
            className="select-existing"
          >
            Select existing {mockSchema.publish.subType.toLowerCase()}
          </Button>
        </div>
      )
    })

    describe('renders a FileUpload component', () => {
      it('with the text "Drop file here" (singular) if the field schema\'s `limit` property is `1`', () => {
        const mockSchemaWithLimit = {
          ...mockSchema,
          settings: {
            ...mockSchema.settings,
            limit: 1
          }
        }

        const component = (
          <FieldImageEdit
            config={mockConfig}
            onBuildBaseUrl={mockBuildBaseUrl}
            schema={mockSchemaWithLimit}
          />
        )

        expect(component).to.contain(
          <div class="upload-options">
            <span>Drop file to upload or</span>
            <FileUpload
              allowDrop={true}
              accept={mockConfig.FieldImage.accept}
              multiple={false}
              onChange={() => {}}
            />
          </div>
        )
      })

      it('with the text "Drop files here" (plural) if the field schema\'s `limit` property is missing or greater than `1`', () => {
        const mockSchemaWithLimit = {
          ...mockSchema,
          settings: {
            ...mockSchema.settings,
            limit: 4
          }
        }

        const component1 = (
          <FieldImageEdit
            config={mockConfig}
            onBuildBaseUrl={mockBuildBaseUrl}
            schema={mockSchemaWithLimit}
          />
        )

        const component2 = (
          <FieldImageEdit
            config={mockConfig}
            onBuildBaseUrl={mockBuildBaseUrl}
            schema={mockSchema}
          />
        )

        const uploadOptions = (
          <div class="upload-options">
            <span>Drop files to upload or</span>
            <FileUpload
              allowDrop={true}
              accept={mockConfig.FieldImage.accept}
              multiple={true}
              onChange={() => {}}
            />
          </div>
        )

        expect(component1).to.contain(uploadOptions)
        expect(component2).to.contain(uploadOptions)
      })
    })
  })
})
