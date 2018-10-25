import {h, options, render} from 'preact'
import {expect} from 'chai'

import FieldImageReferenceSelect from './FieldImageReferenceSelect'

const fileSize = require('file-size')

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

const mockDocuments = [
  {
    _id: '598b47a01b6abb453d48399f',
    fileName: '0.png',
    mimetype: 'image/png',
    width: 512,
    height: 354,
    contentLength: 62789,
    path: '/media/2017/08/09/0.png',
    createdAt: 1502300064572,
    createdBy: null,
    v: 1,
    url: 'http://cdn.somedomain.tech/media/2017/08/09/0.png'
  },
  {
    _id: '598aeece1b6abb453d48398e',
    fileName: '0.jpg',
    mimetype: 'image/jpeg',
    width: 240,
    height: 320,
    contentLength: 12379,
    path: '/media/2017/08/09/0-1502277326014.jpg',
    createdAt: 1502277326014,
    createdBy: null,
    v: 1,
    url: 'http://cdn.somedomain.tech/media/2017/08/09/0-1502277326014.jpg'
  }
]

describe('FieldImageReferenceSelect component', () => {
  it('has propTypes', () => {
    const component = (
      <FieldImageReferenceSelect />
    )

    expect(component.nodeName.propTypes).to.exist
    expect(Object.keys(component.nodeName.propTypes)).to.have.length.above(0)
  })

  describe('renders columns based on the viewport width', () => {
    it('renders 5 columns if the window width is greater than 800px', () => {
      window.innerWidth = 801

      mount(
        <FieldImageReferenceSelect
          data={mockDocuments}
          selectedRows={{}}
        />
      )

      expect($('div.column').length).to.eql(5)
      expect($('div.column')[0].getAttribute('style')).to.contain(
        'width: 20%'
      )
    })

    it('renders 3 columns if the window width is between 551px and 800px', () => {
      window.innerWidth = 551

      mount(
        <FieldImageReferenceSelect
          data={mockDocuments}
          selectedRows={{}}
        />
      )

      expect($('div.column').length).to.eql(3)
      expect($('div.column')[0].getAttribute('style')).to.match(
        /width: 33\.(3)+6%;/
      )
    })

    it('renders 1 columns if the window width is below 551px', () => {
      window.innerWidth = 550

      mount(
        <FieldImageReferenceSelect
          data={mockDocuments}
          selectedRows={{}}
        />
      )

      expect($('div.column').length).to.eql(1)
      expect($('div.column')[0].getAttribute('style')).to.contain(
        'width: 100%'
      )
    })

    it('re-renders columns if the window is resized', done => {
      window.innerWidth = 1024

      mount(
        <FieldImageReferenceSelect
          data={mockDocuments}
          selectedRows={{}}
        />
      )

      expect($('div.column').length).to.eql(5)

      window.innerWidth = 420
      window.dispatchEvent(new Event('resize'))

      setTimeout(() => {
        expect($('div.column').length).to.eql(1)

        done()
      }, 650)
    })
  })

  describe('displays image thumbnails', () => {
    it('renders an image holder per document, with the correct aspect ratio', () => {
      mount(
        <FieldImageReferenceSelect
          data={mockDocuments}
          selectedRows={{}}
        />
      )

      expect($('div.item-image-holder')[0].getAttribute('style')).to.contain(
        `padding-bottom: ${(mockDocuments[0].height / mockDocuments[0].width) * 100}%`
      )
      expect($('div.item-image-holder')[1].getAttribute('style')).to.contain(
        `padding-bottom: ${(mockDocuments[1].height / mockDocuments[1].width) * 100}%`
      )
    })
    it('renders an image per document', () => {
      mount(
        <FieldImageReferenceSelect
          data={mockDocuments}
          selectedRows={{}}
        />
      )

      expect($('img.item-image').length).to.eql(2)
      expect($('img.item-image')[0].getAttribute('src')).to.eql(mockDocuments[0].url)
      expect($('img.item-image')[1].getAttribute('src')).to.eql(mockDocuments[1].url)
    })
  })

  describe('displays one selection input per document', () => {
    it('renders radio buttons if `selectLimit` is `1`', () => {
      mount(
        <FieldImageReferenceSelect
          data={mockDocuments}
          selectLimit={1}
          selectedRows={{}}
        />
      )

      expect($('input.item-select[type="checkbox"]').length).to.eql(0)
      expect($('input.item-select[type="radio"]').length).to.eql(2)
    })

    it('renders checkboxes if `selectLimit` is greater than `1`', () => {
      mount(
        <FieldImageReferenceSelect
          data={mockDocuments}
          selectLimit={5}
          selectedRows={{}}
        />
      )

      expect($('input.item-select[type="checkbox"]').length).to.eql(2)
      expect($('input.item-select[type="radio"]').length).to.eql(0)
    })

    it('renders checkboxes if `selectLimit` is missing', () => {
      mount(
        <FieldImageReferenceSelect
          data={mockDocuments}
          selectedRows={{}}
        />
      )

      expect($('input.item-select[type="checkbox"]').length).to.eql(2)
      expect($('input.item-select[type="radio"]').length).to.eql(0)
    })
  })

  describe('handles image selection', () => {
    it('displays selected items with a different styling', () => {
      mount(
        <FieldImageReferenceSelect
          data={mockDocuments}
          selectedRows={{1: true}}
        />
      )

      expect($('div.item')[0].className).to.not.contain('item-selected')
      expect($('div.item')[1].className).to.contain('item-selected')
    })

    it('fires the `onSelect` callback with a new selection map if an item is selected', () => {
      const onSelect = jest.fn()

      mount(
        <FieldImageReferenceSelect
          data={mockDocuments}
          onSelect={onSelect}
          selectedRows={{0: true}}
        />
      )

      $('div.item')[1].click()

      expect(onSelect.mock.calls[0][0]).to.eql({0: true, 1: true})
    })

    it('fires the `onSelect` callback with a new selection map if an item is deselected', () => {
      const onSelect = jest.fn()

      mount(
        <FieldImageReferenceSelect
          data={mockDocuments}
          onSelect={onSelect}
          selectedRows={{0: true, 1: true}}
        />
      )

      $('div.item')[0].click()

      expect(onSelect.mock.calls[0][0]).to.eql({0: false, 1: true})
    })
  })

  describe('displays image metadata', () => {
    it('displays the image filename', () => {
      const component = (
        <FieldImageReferenceSelect
          data={mockDocuments}
          selectedRows={{}}
        />
      )

      expect(component).to.contain(
        <div class="item-overlay">
          <p class="item-filename">{mockDocuments[0].fileName}</p>
        </div>
      )

      expect(component).to.contain(
        <div class="item-overlay">
          <p class="item-filename">{mockDocuments[1].fileName}</p>
        </div>
      )
    })

    it('displays the image size in a human-friendly format', () => {
      const component = (
        <FieldImageReferenceSelect
          data={mockDocuments}
          selectedRows={{}}
        />
      )

      expect(component).to.contain(
        <span class="item-size">{fileSize(mockDocuments[0].contentLength).human('si')}</span>
      )

      expect(component).to.contain(
        <span class="item-size">{fileSize(mockDocuments[1].contentLength).human('si')}</span>
      )
    })

    it('displays the image dimensions', () => {
      const component = (
        <FieldImageReferenceSelect
          data={mockDocuments}
          selectedRows={{}}
        />
      )

      expect(component).to.contain(
        <span class="item-dimensions">{mockDocuments[0].width}x{mockDocuments[0].height}</span>
      )

      expect(component).to.contain(
        <span class="item-dimensions">{mockDocuments[1].width}x{mockDocuments[1].height}</span>
      )
    })

    it('displays the image mime type', () => {
      const component = (
        <FieldImageReferenceSelect
          data={mockDocuments}
          selectedRows={{}}
        />
      )

      expect(component).to.contain(
        <span class="item-mimetype">{mockDocuments[0].mimetype}</span>
      )

      expect(component).to.contain(
        <span class="item-mimetype">{mockDocuments[1].mimetype}</span>
      )
    })
  })

  it('removes the resize event listener on unmount', () => {
    let component

    mount(
      <FieldImageReferenceSelect
        data={mockDocuments}
        ref={c => component = c}
        selectedRows={{}}
      />
    )

    const resizeHandler = component.debouncedResizeHandler
    const removeEventListenerCopy = window.removeEventListener
    const mockRemoveEventListener = jest.fn()

    window.removeEventListener = mockRemoveEventListener

    mount(null).remove()

    window.removeEventListener = removeEventListenerCopy

    expect(mockRemoveEventListener.mock.calls.length).to.eql(1)
    expect(mockRemoveEventListener.mock.calls[0][0]).to.eql('resize')
    expect(mockRemoveEventListener.mock.calls[0][1].toString()).to.eql(resizeHandler.toString())
  })
})