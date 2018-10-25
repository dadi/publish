import {h, options, render} from 'preact'
import {expect} from 'chai'

import * as utils from 'lib/util'

utils.getUniqueId = () => 'c-1'

import FieldMediaEdit from './FieldMediaEdit'
import MockStore from './MockStore'

import * as Constants from 'lib/constants'
import Button from 'components/Button/Button'
import DropArea from 'components/DropArea/DropArea'
import FileUpload from 'components/FileUpload/FileUpload'
import Label from 'components/Label/Label'

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
  FieldMedia: {
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

describe('FieldMediaEdit component', () => {
  it('has propTypes', () => {
    const component = (
      <FieldMediaEdit />
    )

    expect(component.nodeName.propTypes).to.exist
    expect(Object.keys(component.nodeName.propTypes)).to.have.length.above(0)
  })

  it('renders a Label component', () => {
    const component = (
      <FieldMediaEdit
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
          <FieldMediaEdit
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
            <img 
              src="https://cdn.somedomain.tech/test.jpg"
              class='thumbnail'
            />
          </div>
        </MockStore>
      )

      expect(component).to.contain(images)
    })

    it('when the `value` prop contains multiple images', () => {
      const component = (
        <MockStore>
          <FieldMediaEdit
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
            <img 
              src="https://cdn.somedomain.tech/test1.jpg"
              class='thumbnail'
            />
            <img 
              src="https://cdn.somedomain.tech/test2.jpg"
              class='thumbnail'
            />
            <img 
              src="https://cdn.somedomain.tech/test3.jpg"
              class='thumbnail'
            />
          </div>
        </MockStore>
      )

      expect(component).to.contain(images)
    })

    it('when the `value` prop contains a raw image', () => {
      const component = (
        <MockStore>
          <FieldMediaEdit
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
            <img 
              src="123456789"
              class='thumbnail'
            />
          </div>
        </MockStore>
      )

      expect(component).to.contain(images)
    })

    it('when the `value` prop contains multiple raw images', () => {
      const component = (
        <MockStore>
          <FieldMediaEdit
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
            <img 
              src="123456789"
              class='thumbnail'
            />
            <img 
              src="234567891"
              class='thumbnail'
            />
            <img 
              src="345678912"
              class='thumbnail'
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
        <FieldMediaEdit
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
    it('with the text "Drop file" (singular) if the field schema\'s `limit` property is `1`', () => {
      const mockSchemaWithLimit = {
        ...mockSchema,
        settings: {
          ...mockSchema.settings,
          limit: 1
        }
      }

      const component = (
        <MockStore>
          <FieldMediaEdit
            config={mockConfig}
            onBuildBaseUrl={mockBuildBaseUrl}
            schema={mockSchemaWithLimit}
          />
        </MockStore>
      )

      const template = (
        <Label label={mockSchema.label}>
          <DropArea
            draggingText="Drop file here"
            onDrop={() => {}}
          >(...)</DropArea>
        </Label>
      )

      expect(component).to.matchTemplate(template)
    })

    it('with the text "Drop files" (plural) if the field schema\'s `limit` property is missing or greater than `1`', () => {
      const mockSchemaWithLimit = {
        ...mockSchema,
        settings: {
          ...mockSchema.settings,
          limit: 4
        }
      }

      const component1 = (
        <MockStore>
          <FieldMediaEdit
            config={mockConfig}
            onBuildBaseUrl={mockBuildBaseUrl}
            schema={mockSchemaWithLimit}
          />
        </MockStore>
      )

      const component2 = (
        <MockStore>
          <FieldMediaEdit
            config={mockConfig}
            onBuildBaseUrl={mockBuildBaseUrl}
            schema={mockSchema}
          />
        </MockStore>
      )

      const template = (
        <Label label={mockSchema.label}>
          <DropArea
            draggingText="Drop files here"
            onDrop={() => {}}
          >(...)</DropArea>
        </Label>
      )

      expect(component1).to.matchTemplate(template)
      expect(component2).to.matchTemplate(template)
    })

    it('renders a placeholder with a button to add files', () => {
      const component = (
        <FieldMediaEdit
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
        <FieldMediaEdit
          config={mockConfig}
          onBuildBaseUrl={mockBuildBaseUrl}
          schema={mockSchemaWithLimit}
        />
      )

      expect(component).to.contain(
        <div class="upload-options">
          <div class="upload-drop">Drop file to upload</div>
          <div>
            <span>or </span>
            <FileUpload
              allowDrop={true}
              accept={mockConfig.FieldMedia.accept}
              multiple={false}
              onChange={() => {}}
            />
          </div>
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
        <FieldMediaEdit
          config={mockConfig}
          onBuildBaseUrl={mockBuildBaseUrl}
          schema={mockSchemaWithLimit}
        />
      )

      const component2 = (
        <FieldMediaEdit
          config={mockConfig}
          onBuildBaseUrl={mockBuildBaseUrl}
          schema={mockSchema}
        />
      )

      const uploadOptions = (
        <div class="upload-options">
          <div class="upload-drop">
            Drop files to upload
          </div>
          <div>
            <span>or </span>
            <FileUpload
              allowDrop={true}
              accept={mockConfig.FieldMedia.accept}
              multiple={true}
              onChange={() => {}}
            />
          </div>
        </div>
      )

      expect(component1).to.contain(uploadOptions)
      expect(component2).to.contain(uploadOptions)
    })

    it('processes uploaded files and fires the `onChange` callback', () => {
      const onChange = jest.fn()
      let component

      mount(
        <FieldMediaEdit
          config={mockConfig}
          onBuildBaseUrl={mockBuildBaseUrl}
          onChange={onChange}
          ref={c => component = c}
          schema={mockSchema}
        />
      )

      const $input = $('input[type="file"]')[0]
      const mockFile1 = {
        name: 'image1.png',
        type: 'image/png',
        size: 43000
      }
      const mockFile1Data = 'data:image/png;base64,1q2w3e4r'
      const mockFile2 = {
        name: 'image2.png',
        type: 'image/jpeg',
        size: 89000
      }
      const mockFile2Data = 'data:image/jpeg;base64,5t6y7u8i'
      const readAsDataURLCopy = FileReader.prototype.readAsDataURL

      FileReader.prototype.readAsDataURL = function (file) {
        const result = file.type === 'image/png'
          ? mockFile1Data
          : mockFile2Data

        Object.defineProperty(this, 'result', {
          value: result
        })

        this.onload()
      }

      component.handleFileChange([mockFile1, mockFile2])

      FileReader.prototype.readAsDataURL = readAsDataURLCopy

      expect(onChange.mock.calls.length).to.eql(1)
      expect(onChange.mock.calls[0][0]).to.eql(mockSchema._id)
      expect(onChange.mock.calls[0][1].length).to.eql(2)

      expect(onChange.mock.calls[0][1][0]._file).to.eql(mockFile1)
      expect(onChange.mock.calls[0][1][0]._previewData).to.eql(mockFile1Data)
      expect(onChange.mock.calls[0][1][0].contentLength).to.eql(mockFile1.size)
      expect(onChange.mock.calls[0][1][0].fileName).to.eql(mockFile1.name)
      expect(onChange.mock.calls[0][1][0].mimetype).to.eql(mockFile1.type)

      expect(onChange.mock.calls[0][1][1]._file).to.eql(mockFile2)
      expect(onChange.mock.calls[0][1][1]._previewData).to.eql(mockFile2Data)
      expect(onChange.mock.calls[0][1][1].contentLength).to.eql(mockFile2.size)
      expect(onChange.mock.calls[0][1][1].fileName).to.eql(mockFile2.name)
      expect(onChange.mock.calls[0][1][1].mimetype).to.eql(mockFile2.type)
    })
  })
})