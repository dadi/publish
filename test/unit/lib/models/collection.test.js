const globals = require(`${__dirname}/../../../../app/globals`) // Always required
const Collection = require(`${__dirname}/../../../../app/lib/models/collection`)
const CollectionRoutes = require(`${__dirname}/../../../../app/lib/helpers/collection-routes`)
const DadiAPI = require('@dadi/api-wrapper')

let collection
let getCollectionsSpy
let getSchemasSpy
let getCollectionRoutesSpy

const mockCollectionResponse = {
  collections: [
    {
      version: '1.0',
      database: 'publish',
      name: 'Books',
      slug: 'books',
      path: '/1.0/publish/books'
    }
  ],
  media: {
    buckets: [ 'mediaStore' ],
    defaultBucket: 'mediaStore'
  }
}

const mockConfigResponse = {
  fields: {}, 
  settings: {}, 
  slug: 'articles'
}

const mockAPIWrapperGetCollections = jest.fn(() => {
  return new Promise(resolve => resolve(mockCollectionResponse))
})

const mockAPIWrapperGetConfig = jest.fn(() => {
  return new Promise(resolve => resolve(mockConfigResponse))
})

DadiAPI.APIWrapper.prototype.getCollections = mockAPIWrapperGetCollections
DadiAPI.APIWrapper.prototype.getConfig = mockAPIWrapperGetConfig

beforeEach(() => {
  collection = new Collection()
  getCollectionsSpy = jest.spyOn(Collection.Collection.prototype, 'getCollections')
  getSchemasSpy = jest.spyOn(Collection.Collection.prototype, 'getSchemas')
  getCollectionRoutesSpy = jest.spyOn(CollectionRoutes.CollectionRoutes.prototype, 'generateApiRoutes')

})

describe('Collection', () => {
  it('should export object', () => {
    expect(collection).toBeInstanceOf(Object)
  })

  describe('buildCollectionRoutes()', () => {
    it('should call getCollections', () => {
      collection.buildCollectionRoutes()

      expect(getCollectionsSpy)
        .toHaveBeenCalled()
    })

    it('should return a promise', () => {      
      expect(collection.buildCollectionRoutes())
        .toBeInstanceOf(Promise)
    })

    it('should CollectionRoutes.generateApiRoutes with apiCollections', (done) => {
      collection.buildCollectionRoutes().then(resp => {
        expect(getCollectionRoutesSpy)
          .toHaveBeenCalledWith(expect.any(Array))

        done()
      })
    })
  })

  describe('getCollections()', () => {
    it('should request collections from api-wrapper', () => {
      expect(mockAPIWrapperGetCollections)
        .toHaveBeenCalled()
    })

    it('should call getSchema with collection data', () => {
      expect(getSchemasSpy)
        .toHaveBeenCalledWith(expect.any(Object), expect.any(Object))
    })
  })
})

// getCollections
// buildCollectionRoutes
// getSchemas

